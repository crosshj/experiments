

#ifndef PICTURE_H
#define PICTURE_H

#include <block.h>
#include <neighbors.h>
#include <comparison.h>

class Picture {
    Block* blocks;
    int width, height, blockWidth, blockHeight, blocksQty;

    public:
        Picture(int, int, int, int);
        void set(char*);
        char* get();

        Block* getBlock(int);
        void rotateBlock(int, int);
        void swapBlocks(int, int);

        Neighbors* getNeighbors(int);
        Comparison* compare(Neighbors*);
};

#endif
