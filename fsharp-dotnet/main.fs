open System
open Library

[<EntryPoint>]
let main argv =
  printfn "Hello World"
  printfn "Assembly function output = %A" (MyAssembly.myFunction 10 40)
  0
