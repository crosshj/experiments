{
  http://kanaka.github.io/pascal.js/
  also awesome - https://github.com/kripken/llvm.js
  - https://badassjs.com/post/39573969361/llvmjs-llvm-itself-compiled-to-javascript-via
}
program Fibonacci;     
var
 i, result : integer;

function fib(n : integer) : integer;
begin
    if n <= 2 then fib := 1
    else fib := fib(n-2) + fib(n-1)
end;

begin
  for i := 1 to 20 do
  begin
    result := fib(i);
    writeln(i, ' : ', result)
  end
end.
