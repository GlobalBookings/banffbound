export function fmtMoney(micros) {
  return `$${(micros / 1_000_000).toFixed(2)}`;
}

export function fmtPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

export function fmtNumber(n) {
  return n.toLocaleString('en-CA');
}
