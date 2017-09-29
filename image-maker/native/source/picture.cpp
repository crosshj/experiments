#include "picture.h"

Picture::Picture (int w, int h, int bw, int bh) {
    blocksQty = (w/bw)*(h/bh);
    width = w; height = h; blockWidth = bw; blockHeight = bh;
    blocks = new Block[blocksQty];
    for(int i=0; i < blocksQty; i++){
      blocks[i].init(bw, bh);
    }
    //std::cout << "Number of blocks: " << (w/bw)*(h/bh) << std::endl;
  }

void Picture::set (char* picArray) {
    //int whichY = -1;
    for (int i = 0; i < width*height; i++) {
        int whichBlock = i%width/blockWidth + i/height/blockHeight*width/blockWidth;
        int whichX = i % blockWidth;
        int whichY = i/width % blockHeight;
        //std::cout << whichBlock << " " << width << " " << blockWidth << " " << whichX << " " << whichY << std::endl;
        
        // LAME?? (or is the above lame??)
        // https://stackoverflow.com/questions/514637/is-it-more-efficient-to-branch-or-multiply
        // http://cpp.sh/2uxyy
        // if (i % height == 0){
        //   whichY++;
        // }
        // if (whichY > blockHeight){
        //   whichY = 0;
        // }
        blocks[whichBlock].set(whichX, whichY, &picArray[i*4]);
    }
}

char* Picture::get () {
    char* picArray = new char[width*height*3];
    //std::cout << "Size of image: " << width*height*3 << std::endl;
    int currentPicArrayMember = 0;
    // top to bottom
    for (int j = 0; j < height/blockHeight; j++) {
        // each horizontal line of block
        for (int k = 0; k < blockHeight; k++) {
        // each block in row
        for (int i = 0; i < width/blockWidth; i++) {
            char* blockRow = blocks[j*(width/blockWidth) + i].getRow(k);
            // each pixel in row
            for (int l = 0; l < blockWidth*4; l++) {
            picArray[currentPicArrayMember] = blockRow[l];
            currentPicArrayMember++;
            }
        }
        }
    }
    return picArray;
    }

void Picture::rotateBlock (int blockNumber, int degrees){
    blocks[blockNumber].rotate(degrees);
}
