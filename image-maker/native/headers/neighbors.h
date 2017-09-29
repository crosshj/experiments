#ifndef NEIGHBORS_H
#define NEIGHBORS_H

#include <blocks.h>

    class Neighbors {
        Block* north, south, east, west;

        public:
            Neighbors (Block* n, Block* s, Block* e, Block* w)
                : north(n), south(s), east(e), west(w) {}

            Block north(){ return *north }
            Block south(){ return *south }
            Block east(){ return *east }
            Block west(){ return *west }
    };

#endif
