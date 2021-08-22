export function abort(...args: any[]) {
  console.error(...args);
  process.exit(1);
}
