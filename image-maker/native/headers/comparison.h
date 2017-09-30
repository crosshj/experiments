#ifndef COMPARISON_H
#define COMPARISON_H

#include <neighbors.h>

    class Comparison {
        Neighbors* _neighbors;

        public:
            Comparison (Neighbors* n) {
                _neighbors = n;
            }
    };

#endif
