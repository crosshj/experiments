

#ifndef PICTURE_H
#define PICTURE_H

#include <block.h>
#include <neighbors.h>
#include <comparison.h>

class Picture {
    Block* blocks;
    int width, height, blockWidth, blockHeight, blocksQty;

    Neighbors* getNeighbors(int);
    Comparison* compare(Neighbors*);

    public:
        Picture(int, int, int, int);
        void set(char*);
        char* get();

        Block* getBlock(int);
        void rotateBlock(int, int);
        void swapBlocks(int, int);
        bool swapRotateBestMatch(int, int, int);
};

#endif
