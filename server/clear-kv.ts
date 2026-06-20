// Local dev helper: clear KV so payouts can be re-tested. Opens the same store as
// the server (via KV_PATH); deno task clear-kv passes --env-file=.env.
//   deno task clear-kv          # receipts only (keeps the 24h auth token)
//   deno task clear-kv --all    # everything (forces a fresh SMS re-auth)
const kv = await Deno.openKv(Deno.env.get("KV_PATH") || undefined);
const all = Deno.args.includes("--all");
const prefixes = all ? [[]] : [["payout_reciept"]];
let count = 0;
for (const prefix of prefixes) {
  for await (const entry of kv.list({ prefix })) {
    await kv.delete(entry.key);
    count++;
  }
}
console.log(`Cleared ${count} KV entr${count === 1 ? "y" : "ies"}${all ? " (all)" : " (receipts)"}.`);
await kv.close();
