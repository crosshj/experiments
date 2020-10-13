// https://gist.github.com/rflechner/2b59e81381bc59306dff9cc4147d4f18

let rec fiboRec =
  function
  | 0L -> 0L
  | 1L -> 1L
  | n -> fiboRec (n-1L) + fiboRec (n-2L)

for i in 0L..10L do
  printfn "fiboRec of %d => %d" i (fiboRec i)
