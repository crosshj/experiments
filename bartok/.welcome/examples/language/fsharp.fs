let rec fiboRec =
  function
  | 0L -> 0L
  | 1L -> 1L
  | n -> fiboRec (n-1L) + fiboRec (n-2L)

#time
for i in 0L..40L do
  printfn "fiboRec of %d => %d" i (fiboRec i)
#time