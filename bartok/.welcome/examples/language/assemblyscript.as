function fib(n: i32): i32 {
  let a = 0;
  let b = 1;
  if (n <= 0){
    return a;
  }
  while (--n) {
    const t = a + b;
    a = b;
    b = t;
  }
  return b;
}

export function main(): string {
  let array: i32[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  return array.map<i32>((i) => fib(i)).join('\n');
}
