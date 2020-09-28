-- maybe use Pascal syntax highlighter?
-- https://en.wikipedia.org/wiki/Ada_(programming_language)
-- https://wiki.freepascal.org/Hello,_World
-- https://codemirror.net/mode/pascal/index.html

with Ada.Text_IO; use Ada.Text_IO;
with Ada.Long_Integer_Text_IO; use Ada.Long_Integer_Text_IO;

procedure Fib is
    function Fib (N : Long_Integer) return Long_Integer is
    begin
        if N <= 1 then
            return 1;
        end if;
        return Fib (N - 1) + Fib (N - 2);
    end Fib;
begin
    Put (Fib (46));
    New_Line;
end Fib;