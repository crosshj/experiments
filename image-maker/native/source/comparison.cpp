
#include <comparison.h>
#include <neighbors.h>

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