: fib ( n1 -- n2 )
  dup 1 > if
  1- dup 1- recurse swap recurse + then
;

: f ( n1 -- n2 )
  dup abs fib swap
  dup 0< swap 2 mod 0= and if negate then
;

: fib_print ( n -- )
  dup . ." th Fibonacci number is " f . cr
;

: main ( -- )
 argc @ 2 =
 next-arg s>number?
 3 roll and if
     d>s fib_print else
     ." Usage: gforth-fast ./f1a.fs <n>" cr then
;

main
bye
