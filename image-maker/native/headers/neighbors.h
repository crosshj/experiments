#ifndef NEIGHBORS_H
#define NEIGHBORS_H

#include <block.h>

    class Neighbors {
        Block* _center;
        Block* _north;
        Block* _south;
        Block* _east;
        Block* _west;

        public:
            Neighbors (Block* c, Block* n, Block* s, Block* e, Block* w){
                _center = c; _north = n; _south = s; _east = e; _west = w;
            }

            Block center(){ return *_center; };
            Block north(){ return *_north; };
            Block south(){ return *_south; };
            Block east(){ return *_east; };
            Block west(){ return *_west; };
    };

#endif
