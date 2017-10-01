#ifndef COMPARISON_H
#define COMPARISON_H

#include <neighbors.h>

    class Comparison {
        Neighbors* _neighbors;
        public:
            Comparison (Neighbors* n);
            int topToTop, topToRight, topToBottom, topToLeft,
                rightToRight, rightToBottom, rightToLeft,
                bottomToBottom, bottomToLeft,
                leftToLeft;
            int bestRotateMatch(); 
    };

#endif
