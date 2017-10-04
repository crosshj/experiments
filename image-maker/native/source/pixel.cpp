#include <pixel.h>

void Pixel::set (char r, char g, char b, char a) {
    red=r; green=g; blue=b; alpha=a;
}

char* Pixel::get(){
    char* pixel = new char[4]{ red, green, blue, alpha};
    return pixel;
}

char Pixel::getBW(){
    // TODO: color vs B&W compare
    // https://www.johndcook.com/blog/2009/08/24/algorithms-convert-color-grayscale/
    // bw = 0.3*r + 0.6*g + 0.1*b;
    char result = 0.3*(red & 0xff) + 0.6*(green & 0xff) + 0.1*(blue & 0xff);
    return result;
}
