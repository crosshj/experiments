#ifndef BLOCK_H
#define BLOCK_H

#include <pixel.h>

class Block {
    Pixel* pixels;
    int width, height;
    Pixel getPixel(int, int);

    public:
        void init(int, int);
        void set(int, int, char*);
        char* getRow(int);
        char* getColumn(int);
        void rotate(int);
        Pixel* northEdge ();
        Pixel* southEdge ();
        Pixel* eastEdge ();
        Pixel* westEdge ();
};

#endif
