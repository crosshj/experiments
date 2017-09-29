#ifndef BLOCK_H
#define BLOCK_H

#include "pixel.h"

class Block {
    Pixel* pixels;
    int width, height;
    Pixel getPixel(int, int);

    public:
        Block() {}
        void init(int, int);
        void set(int, int, char*);
        char* getRow(int);
        char* getColumn(int);
        void rotate(int);
        // Pixel* upperLeftEdge ();
        // Pixel* upperRightEdge ();
        // Pixel* lowerLeftEdge ();
        // Pixel* lowerRightEdge ();
};

#endif
