
#include <comparison.h>
#include <neighbors.h>

// TODO: color vs B&W compare
// https://www.johndcook.com/blog/2009/08/24/algorithms-convert-color-grayscale/
// bw = 0.3*r + 0.6*g + 0.1*b;

// TODO: how different are two sets of numbers?
// https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test
// https://en.wikipedia.org/wiki/Standard_deviation
// https://mpatacchiola.github.io/blog/2016/11/12/the-simplest-classifier-histogram-intersection.html
// https://stats.stackexchange.com/questions/7400/how-to-assess-the-similarity-of-two-histograms
// https://en.wikipedia.org/wiki/Goodness_of_fit
// https://en.wikipedia.org/wiki/Data_binning

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