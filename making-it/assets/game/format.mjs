// Big-number formatting for Streams (12.3K, 4.56M, 1.20B...) and plain GBP.
const UNITS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];

export const formatStreams = (n) => {
    if (!isFinite(n)) return '∞';
    if (n < 1000) return Math.floor(n).toLocaleString('en-GB');
    let tier = 0;
    while (n >= 1000 && tier < UNITS.length - 1) {
        n /= 1000;
        tier++;
    }
    return `${n.toFixed(2)}${UNITS[tier]}`;
};

export const formatRate = (n) => {
    if (n === 0) return '0';
    if (n < 1000) return n.toFixed(1).replace(/\.0$/, '');
    return formatStreams(n);
};

// The whole point: money is shown in full, painful precision so it visibly
// crawls while streams rocket.
export const formatMoney = (n) =>
    n.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' });
