# import ../../shared.styl
#=

use https://github.com/Keno/julia-wasm

=#

function fib(n)
	if n <= 1 return n end
	return fib(n - 1) + fib(n - 2)
end

for i in 0:9
	println(fib(i))
end
