// "Making It" payout backend — deploy to the NEW Deno Deploy (console.deno.com;
// classic is sunset 2026-07-20). Uses Deno.serve + Deno.openKv (both supported)
// and npm:@prelude.so/sdk for SMS OTP. Set these as dashboard secrets (production
// timeline) — never commit them:
//   AUTHORIZED_PHONE, PRELUDE_API_KEY, WISE_API_KEY, WISE_PROFILE_ID,
//   WISE_TARGET_ACCOUNT, NTFY_TOPIC (optional push channel for "go fund it" pings)
//
// Note: personal Wise accounts can't fund transfers via API (PSD2/SCA), so /sync
// only CREATES transfers; they're funded once, by hand, in the Wise app. An ntfy
// notification fires on each successful creation so the transfer can be paid ASAP.
// Adapted from the prior archipelago-achievements service. Only the ACHIEVEMENTS
// map (now clicker-themed) and CORS (now an allowlist) differ; the auth/verify/
// sync/Wise/one-time-KV logic is unchanged.
import Prelude from "npm:@prelude.so/sdk";

const AUTHORIZED_PHONE = Deno.env.get("AUTHORIZED_PHONE");
const PRELUDE_API_KEY = Deno.env.get("PRELUDE_API_KEY");
const WISE_API_KEY = Deno.env.get("WISE_API_KEY");
const WISE_PROFILE_ID = Deno.env.get("WISE_PROFILE_ID");
const WISE_TARGET_ACCOUNT = Deno.env.get("WISE_TARGET_ACCOUNT");
const NTFY_TOPIC = Deno.env.get("NTFY_TOPIC");

// Local dev can point KV at an on-disk file via KV_PATH (so clear-kv.ts hits the
// same store); on Deno Deploy KV_PATH is unset and the managed KV is used.
const kv = await Deno.openKv(Deno.env.get("KV_PATH") || undefined);
const preludeClient = new Prelude({ apiToken: PRELUDE_API_KEY });

// Canonical, server-side payout amounts (GBP). The client cannot change these;
// the worst a tampered client can do is claim achievements, and each pays at
// most once (see the payout_reciept KV guard in handleSync). The ids match
// making-it/assets/game/achievements.mjs. Escalating, summing to £250:
//   1 + 2 + 4 + 13 + 25 + 40 + 75 + 90 = 250
// References are clamped to 18 chars before sending (Wise caps GBP paymentReference
// at 18 — UK Faster Payments rails), and kept aligned to the client's UI names in
// making-it/assets/game/achievements.mjs so William's bank statement matches the app.
const ACHIEVEMENTS: Record<string, { amount: number; reference: string }> = {
  "07F08048-4CD2-466C-93D7-98ED6319EDF6": { amount: 1, reference: "First Real Pound" },
  "F49C0E08-5496-45F3-978A-6DE34A6646D2": { amount: 2, reference: "Going Pro" },
  "79CE638C-B36D-40C2-87AD-AC9B63DD8FBA": { amount: 4, reference: "Algorithm's Pet" },
  "541E93D7-192F-47FB-8593-75DB7C83E1CE": { amount: 13, reference: "A Million Plays" },
  "4DC90B2C-C590-4652-A364-2C3757B54B44": { amount: 25, reference: "100 Quid On Paper" },
  // Phase 2 — first Fan/Patreon generator. Reserved now so the curve totals £250.
  "AE193869-13A7-4876-B6EC-765E7D6413D6": { amount: 40, reference: "The Diversifier" },
  "FC9FCB25-5C7A-42B9-8D2E-2D5EAA5C33F6": { amount: 75, reference: "Ten Million Plays" },
  "A8055D2A-4340-41B6-8A11-157EA6E7B161": { amount: 90, reference: "Out of the Game" },
};

// Allowlisted origins (plus any localhost port for local dev). Mirrors the
// requesting Origin back so the site survives a move to the birthdays subdomain.
const ALLOWED_ORIGINS = new Set([
  "https://williambridge.co.uk",
  "https://www.williambridge.co.uk",
  "https://birthdays.williambridge.co.uk",
]);
function resolveOrigin(request: Request): string {
  const origin = request.headers.get("Origin") ?? "";
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  try {
    if (new URL(origin).hostname === "localhost") return origin;
  } catch { /* no/invalid Origin */ }
  return "https://williambridge.co.uk";
}

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sendSMS(phoneNumber: string): Promise<boolean> {
  const international_number = phoneNumber.startsWith("0") ? "+44" + phoneNumber.slice(1) : phoneNumber;
  const verification = await preludeClient.verification.create({
    target: { type: "phone_number", value: international_number },
  });
  return verification.status === "success";
}

async function verifyOTP(phoneNumber: string, code: string): Promise<boolean> {
  const international_number = phoneNumber.startsWith("0") ? "+44" + phoneNumber.slice(1) : phoneNumber;
  const check = await preludeClient.verification.check({
    target: { type: "phone_number", value: international_number },
    code: code,
  });
  return check.status === "success";
}

// Push a "go fund this transfer" alert via ntfy (https://ntfy.sh/<NTFY_TOPIC>).
// Best-effort: a notification failure must never fail the payout.
async function notifyTransferReady(amount: number, reference: string, transferId: string): Promise<void> {
  if (!NTFY_TOPIC) return;
  try {
    await fetch("https://ntfy.sh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: NTFY_TOPIC,
        title: `Pay William £${amount}`,
        message: `"${reference}" is set up in Wise and awaiting funds — open the app and send it ASAP. (transfer ${transferId})`,
        priority: 4,
        tags: ["money_with_wings"],
      }),
    });
  } catch (error) {
    console.error("Failed to send ntfy notification", error);
  }
}

// Personal Wise accounts can no longer fund transfers via the API — PSD2/SCA means
// the funding step requires in-app approval. So we only CREATE the transfer here
// (quote → transfer); it sits in Wise "awaiting your money" until funded once from
// the Wise app/website. Returns the transfer id on success, or null on failure.
async function createTransfer(amount: number, reference: string): Promise<string | null> {
  const quoteResponse = await fetch(
    `https://api.wise.com/v3/profiles/${WISE_PROFILE_ID}/quotes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${WISE_API_KEY}` },
      body: JSON.stringify({
        sourceCurrency: "GBP",
        targetCurrency: "GBP",
        payOut: "BALANCE",
        targetAccount: WISE_TARGET_ACCOUNT,
        sourceAmount: amount,
      }),
    },
  );
  if (!quoteResponse.ok) {
    try { console.error("Failed to create Wise quote", await quoteResponse.text()); }
    catch { console.error("Failed to create Wise quote and could not retrieve body"); }
    return null;
  }
  const { id: quoteId } = await quoteResponse.json();
  const transferResponse = await fetch(
    `https://api.wise.com/v1/transfers`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${WISE_API_KEY}` },
      body: JSON.stringify({
        targetAccount: WISE_TARGET_ACCOUNT,
        quoteUuid: quoteId,
        customerTransactionId: crypto.randomUUID(),
        details: {
          // Wise caps GBP paymentReference at 18 chars; clamp as a backstop.
          reference: reference.slice(0, 18),
          transferPurpose: "verification.transfers.purpose.send.to.family",
          sourceOfFunds: "verification.source.of.funds.salary",
        },
      }),
    },
  );
  if (!transferResponse.ok) {
    try { console.error("Failed to create Wise transfer", await transferResponse.text()); }
    catch { console.error("Failed to create Wise transfer and could not retrieve body"); }
    return null;
  }
  const { id: transferId, hasActiveIssues } = await transferResponse.json();
  if (hasActiveIssues) {
    console.error("Wise transfer has active issues, failing");
    return null;
  }
  // Created and awaiting manual funding in the Wise app. Surface it for reconciliation.
  console.info(`Wise transfer ${transferId} created (${reference}, £${amount}) — fund it in the Wise app.`);
  return String(transferId);
}

async function handleAuth(request: Request): Promise<Response> {
  const { phoneNumber } = await request.json();
  if (!phoneNumber || phoneNumber !== AUTHORIZED_PHONE) {
    console.error("Unauthorised phone number on auth error");
    return new Response(JSON.stringify({ error: "Unauthorized phone number" }), {
      status: 401, headers: { "Content-Type": "application/json" },
    });
  }
  const success = await sendSMS(phoneNumber);
  if (!success) {
    console.error("Failed to send SMS");
    return new Response(JSON.stringify({ error: "Failed to send SMS" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ message: "SMS sent successfully" }), {
    headers: { "Content-Type": "application/json" },
  });
}

async function handleVerify(request: Request): Promise<Response> {
  const { phoneNumber, code } = await request.json();
  if (!phoneNumber || phoneNumber !== AUTHORIZED_PHONE) {
    console.error("Unauthorised phone number on verification error");
    return new Response(JSON.stringify({ error: "Unauthorized phone number" }), {
      status: 401, headers: { "Content-Type": "application/json" },
    });
  }
  const isValid = await verifyOTP(phoneNumber, code);
  if (!isValid) {
    console.error("Invalid verification error");
    return new Response(JSON.stringify({ error: "Invalid verification code" }), {
      status: 401, headers: { "Content-Type": "application/json" },
    });
  }
  const token = generateToken();
  await kv.set(["auth_tokens", token], {
    phoneNumber,
    createdAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000),
  });
  return new Response(JSON.stringify({ token }), {
    headers: { "Content-Type": "application/json" },
  });
}

async function handleSync(request: Request): Promise<Response> {
  const { token, ids } = await request.json();
  if (!token || !Array.isArray(ids)) {
    console.error("Invalid sync request error");
    return new Response(JSON.stringify({ error: "Invalid request format" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }
  const tokenData = await kv.get(["auth_tokens", token]);
  if (!tokenData.value || (tokenData.value as { expiresAt: number }).expiresAt < Date.now()) {
    console.error("Token expired error");
    return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
      status: 401, headers: { "Content-Type": "application/json" },
    });
  }

  const processedIds = [];
  for (const id of ids) {
    const kv_id = ["payout_reciept", id];
    const reciept = await kv.get(kv_id);
    if (reciept.value !== null) {
      // Already paid — return the receipt, never pay twice.
      processedIds.push({ id, processed: true, ...reciept.value });
      continue;
    }
    if (!(id in ACHIEVEMENTS)) {
      // Unknown id: return a random processed flag to frustrate value sniffing.
      processedIds.push({ id, processed: Math.round(Math.random()) === 1, timestamp: Date.now() });
      continue;
    }
    const { amount, reference } = ACHIEVEMENTS[id];
    if (!Number.isFinite(amount) || typeof reference !== "string") {
      console.error(`Achievement ${id} is malformed.`);
      processedIds.push({ id, processed: false, timestamp: Date.now() });
      continue;
    }
    let transferId: string | null = null;
    try {
      transferId = await createTransfer(amount, reference);
    } catch {
      // Fall through to the failure branch below.
    }
    if (!transferId) {
      console.error(`Unsuccessful payout for achievement ${id}`);
      processedIds.push({ id, processed: false, timestamp: Date.now() });
      continue;
    }
    const payload = { amount, reference, transferId, timestamp: Date.now() };
    await kv.set(kv_id, payload);
    await notifyTransferReady(amount, reference, transferId);
    processedIds.push({ id, processed: true, ...payload });
  }

  return new Response(JSON.stringify({
    message: "Sync completed",
    processed: processedIds.length,
    results: processedIds,
  }), { headers: { "Content-Type": "application/json" } });
}

async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const corsHeaders = {
    "Access-Control-Allow-Origin": resolveOrigin(request),
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    let response: Response;
    switch (url.pathname) {
      case "/auth": response = await handleAuth(request); break;
      case "/verify": response = await handleVerify(request); break;
      case "/sync": response = await handleSync(request); break;
      default:
        response = new Response(JSON.stringify({ error: "Not found" }), {
          status: 404, headers: { "Content-Type": "application/json" },
        });
    }
    const headers = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
    return new Response(response.body, { status: response.status, headers });
  } catch (error) {
    console.error("Top level handler error", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

Deno.serve(handler);
