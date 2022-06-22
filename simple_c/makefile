all: a.out

run: a.out
	./a.out

a.out: prog.o
	gcc prog.o

prog.o: prog.c
	gcc -c prog.c

clean:
	rm prog.o a.out
