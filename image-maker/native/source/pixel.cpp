#include "pixel.h"

void Pixel::set (char r, char g, char b, char a) {
    red=r; green=g; blue=b; alpha=a;
}

char* Pixel::get(){
    char* pixel = new char[4]{ red, green, blue, alpha};
    return pixel;
}
