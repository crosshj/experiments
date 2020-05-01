// because I forgot how to start a c file
// https://www.improgrammer.net/how-to-write-c-program-in-ubuntu/

#include <stdio.h>
#include <string.h>
#include <stdarg.h>
#include <stdlib.h>

typedef enum {
    true=1, false=0
} bool;

typedef struct _console {
    void (*log)(char* arg, ...);
} _console;

void _log(char* arg, ...) {
  va_list valist;

  /* initialize valist for num number of arguments */
  va_start(valist, arg);

  printf("\033[0;32m");
  while(strcmp(arg, "") != 0){
    printf("%s", arg);
    arg = va_arg(valist, char*);
  }

  /* clean memory reserved for valist */
  va_end(valist);

  printf("\n");
  printf("\033[0m");
  return;
}

_console Console() {
    struct _console aConsole;
    aConsole.log = &_log;
    return aConsole;
}

void jsNotes(){
  struct _console console = Console();

  console.log("\e[1;1H\e[2J", ""); //clear terminal

  console.log("LET'S WRITE JS IN C!!!", "");
  console.log("\nconsole.log:\n   last (blank) argument must be included - ", "LAME", "");
  console.log("   The alternative is that number of args is specified.", "");
  return;
}

void progExercise(){
  int length = 100;
  char myNumber[length];
  char firstChar;
  char lastChar;

  printf("\nEnter a number (%d):\n", rand());
  scanf("%s", myNumber);

  printf("\nYOUR NUMBER: \t%s\n", myNumber);

  printf("EACH CHAR: \t");
  int i = 0;
  while(i < length){
    if(strcmp(&myNumber[i], "") == 0){
      lastChar = myNumber[i-1];
      break;
    }
    if(i == 0){
      firstChar = myNumber[i];
    }
    printf("%c ", myNumber[i]);
    i++;
  }

  printf("\nFIRST: \t\t%c", firstChar);
  printf("\nLAST: \t\t%c", lastChar);

  i = 0;
  while(i < length){
    if(strcmp(&myNumber[i], "") == 0){
      myNumber[i-1] = firstChar;
      break;
    }
    if(i == 0){
      myNumber[i] = lastChar;
    }
    i++;
  }
  printf("\nFLIPPED: \t%s\n", myNumber);
  return;
}

int main(){
  char ch;
  while(1) {
    jsNotes();
    progExercise();

    printf("\nPRESS ENTER FOR ANOTHER...");
    fflush(stdout);
    scanf("%c", &ch);
    scanf("%c",&ch);
  };

  return 0;
}
