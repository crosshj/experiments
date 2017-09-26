#include <iostream>

#ifndef NATIVECHOP_H
#define NATIVECHOP_H

class Pixel {
  int red, green, blue;

  public:
    void set(int, int, int);
};

void Pixel::set (int r, int g, int b) {
  red=r; green=g; blue=b;
}

// ----------------------------------------------------
class Block {
  Pixel* pixels;
  int width, height;

  public:
    Block() {}
    void init(int, int);
    void set(int, int, int*);
    void rotate(int);
    Pixel* upperLeftEdge ();
    Pixel* upperRightEdge ();
    Pixel* lowerLeftEdge ();
    Pixel* lowerRightEdge ();
};

void Block::init (int w, int h) {
  width = w;
  height = h;
  pixels = new Pixel [w*h];
}

void Block::set (int x, int y, int* blockArray){
  //std::cout << x << " " << y << " " << blockArray[0] << std::endl; 
  pixels[width*y + x].set(blockArray[0], blockArray[1], blockArray[2]);
}

// ----------------------------------------------------
class Picture {
  Block* blocks;
  int width, height, blockWidth, blockHeight, blocksQty;

  public:
    Picture(int, int, int, int);
    void set(int*);
    char* get();
  };

Picture::Picture (int w, int h, int bw, int bh) {
  blocksQty = (w/bw)*(h/bh);
  width = w; height = h; blockWidth = bw; blockHeight = bh;
  blocks = new Block[blocksQty];
  for(int i=0; i < blocksQty; i++){
    blocks[i].init(bw, bh);
  }
  //std::cout << "Number of blocks: " << (w/bw)*(h/bh) << std::endl;
}

void Picture::set (int* picArray) {
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
    blocks[whichBlock].set(whichX, whichY, &picArray[i*3]);
  }
}

char* Picture::get () {
  char* picArray = new char[width*height*3];
  //std::cout << "Size of image: " << width*height*3 << std::endl;
  
  // top to bottom
  for (int j = 0; j < height/blockHeight; j++) {
    // each horizontal line of block
    for (int k = 0; k < blockheight; k++) {
      // each block in row
      for (int i = 0; i < width/blockWidth; i++) {
        
      }
    }
  }
  return picArray;
}


#endif
