fib x =
  case x of
    0 -> 1
    1 -> 1
    _ -> fib (x-1) + fib (x-2)

ml x =
  List.range 1 x

fibs x =
  List.map fib (ml x)