#ifndef COMPARISON_H
#define COMPARISON_H

#include <neighbors.h>

    class Comparison {
        Neighbors* _neighbors;
        public:
            Comparison (Neighbors* n);
            int topToTop,    topToRight,    topToBottom,    topToLeft,
                rightToTop,  rightToRight,  rightToBottom,  rightToLeft,
                bottomToTop, bottomToRight, bottomToBottom, bottomToLeft,
                leftToTop,   leftToRight,   leftToBottom,   leftToLeft;
            int bestRotateMatch();
            int comparePixelRows(int, bool, Pixel*, Pixel*);
    };

#endif
