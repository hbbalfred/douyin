export function abort(...args: any[]) {
  console.error(...args);
  process.exit(1);
}

export function normFileName(name: string) {
  return name.replace(/\//g, "-");
}