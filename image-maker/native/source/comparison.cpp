
#include <comparison.h>
#include <neighbors.h>

// TODO: color vs B&W compare
// https://www.johndcook.com/blog/2009/08/24/algorithms-convert-color-grayscale/
// bw = 0.3*r + 0.6*g + 0.1*b;

Comparison::Comparison (Neighbors* n) {
    _neighbors = n;

    topToTop = 0; //TODO
    topToRight = 0; //TODO
    topToBottom = 0; //TODO
    topToLeft = 0; //TODO

    rightToRight = 0; //TODO
    rightToBottom = 0; //TODO
    rightToLeft = 0; //TODO

    bottomToBottom = 0; //TODO
    bottomToLeft = 0; //TODO

    leftToLeft = 0; //TODO
}

int Comparison::bestRotateMatch(){
    int bestRotate = 90; //TODO

    // compare matches at 4 rotations

    return bestRotate;
}