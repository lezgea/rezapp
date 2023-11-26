export function prettyMoney(amountCents) {
    const amountUsd = amountCents / 100;
    const sign = amountCents < 0 ? '-' : '';
    return sign + '$' + Math.abs(amountUsd).toFixed(2);
}
