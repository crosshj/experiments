#include <iostream>

#include <comparison.h>
#include <neighbors.h>

#define FORWARD true
#define REVERSE false

// TODO: how different are two sets of numbers?
// https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test
// https://en.wikipedia.org/wiki/Standard_deviation
// https://mpatacchiola.github.io/blog/2016/11/12/the-simplest-classifier-histogram-intersection.html
// https://stats.stackexchange.com/questions/7400/how-to-assess-the-similarity-of-two-histograms
// https://en.wikipedia.org/wiki/Goodness_of_fit
// https://en.wikipedia.org/wiki/Data_binning

Comparison::Comparison (Neighbors* n) {
    _neighbors = n;

    topToTop = comparePixelRows(
        n->center().getWidth(),
        FORWARD,
        n->center().northEdge(),
        n->north().southEdge()
    );
    topToRight = comparePixelRows(
        n->center().getWidth(),
        FORWARD,
        n->center().northEdge(),
        n->east().westEdge()
    );
    topToBottom = comparePixelRows(
        n->center().getWidth(),
        REVERSE,
        n->center().northEdge(),
        n->south().northEdge()
    );
    topToLeft = comparePixelRows(
        n->center().getWidth(),
        REVERSE,
        n->center().northEdge(),
        n->north().southEdge()
    );

    rightToTop = comparePixelRows(
        n->center().getWidth(),
        FORWARD,
        n->center().eastEdge(),
        n->north().southEdge()
    );
    rightToRight = comparePixelRows(
        n->center().getWidth(),
        FORWARD,
        n->center().eastEdge(),
        n->east().westEdge()
    );
    rightToBottom = comparePixelRows(
        n->center().getWidth(),
        REVERSE,
        n->center().eastEdge(),
        n->south().northEdge()
    );
    rightToLeft = comparePixelRows(
        n->center().getWidth(),
        REVERSE,
        n->center().eastEdge(),
        n->west().eastEdge()
    );

    bottomToTop = comparePixelRows(
        n->center().getWidth(),
        REVERSE,
        n->center().southEdge(),
        n->north().southEdge()
    );
    bottomToRight = comparePixelRows(
        n->center().getWidth(),
        REVERSE,
        n->center().southEdge(),
        n->east().westEdge()
    );
    bottomToBottom = comparePixelRows(
        n->center().getWidth(),
        FORWARD,
        n->center().southEdge(),
        n->south().northEdge()
    );
    bottomToLeft = comparePixelRows(
        n->center().getWidth(),
        FORWARD,
        n->center().southEdge(),
        n->west().eastEdge()
    );

    leftToTop = comparePixelRows(
        n->center().getWidth(),
        REVERSE,
        n->center().westEdge(),
        n->north().southEdge()
    );
    leftToRight = comparePixelRows(
        n->center().getWidth(),
        REVERSE,
        n->center().westEdge(),
        n->east().westEdge()
    );
    leftToBottom = comparePixelRows(
        n->center().getWidth(),
        FORWARD,
        n->center().westEdge(),
        n->south().northEdge()
    );
    leftToLeft = comparePixelRows(
        n->center().getWidth(),
        FORWARD,
        n->center().westEdge(),
        n->west().eastEdge()
    );
}

int Comparison::comparePixelRows(int width, bool forward, Pixel* row1, Pixel* row2){
    int difference = 0;
    for( int i=0; i < width; i++){
        int whichRow1Item = forward ? i : width-i-1;
        char pixelValue1 = row1[whichRow1Item].getBW();
        char pixelValue2 = row2[i].getBW();

        difference += pixelValue1 > pixelValue2
            ? pixelValue1 - pixelValue2
            : pixelValue2 - pixelValue1;
    }
    int average = difference / width;

    return average;
}

int Comparison::bestRotateMatch(int tolerance){
    int bestRotate = 0;

    int zeroDeg = (topToTop + rightToRight + bottomToBottom + leftToLeft) / 4;
    int minDiff = zeroDeg;
    
    int ninetyDeg = (topToRight + rightToBottom + bottomToLeft + leftToTop) / 4;
    if(ninetyDeg < minDiff){
        minDiff = ninetyDeg;
        bestRotate = 90;
    }
    int oneEightyDeg = (topToBottom + rightToLeft + bottomToTop + leftToRight) / 4;
    if(oneEightyDeg < minDiff){
        minDiff = oneEightyDeg;
        bestRotate = 180;
    }
    int twoSeventyDeg = (topToLeft + rightToTop + bottomToRight + leftToBottom) / 4;
    if(twoSeventyDeg < minDiff){
        minDiff = twoSeventyDeg;
        bestRotate = 270;
    }

    if(minDiff < tolerance){
        std::cout << "minDiff is less than tolerance: " << minDiff << std::endl;
    }
    return minDiff < tolerance
        ? bestRotate
        : -1;
}