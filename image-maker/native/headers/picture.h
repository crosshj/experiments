

#ifndef PICTURE_H
#define PICTURE_H

#include <block.h>

class Picture {
    Block* blocks;
    int width, height, blockWidth, blockHeight, blocksQty;

    public:
        Picture(int, int, int, int);
        void set(char*);
        char* get();
        void rotateBlock(int, int);
        void swapBlocks(int, int);
};

#endif
