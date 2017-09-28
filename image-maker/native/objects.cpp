#include <iostream>

#ifndef NATIVECHOP_H
#define NATIVECHOP_H

class Pixel {
  int red, green, blue, alpha;

  public:
    void set(char, char, char, char);
    char* get();
  };

void Pixel::set (char r, char g, char b, char a) {
  red=r; green=g; blue=b; alpha=a;
}

char* Pixel::get(){
  char pixel [4] = { red, green, blue, alpha};
  return pixel;
}

// ----------------------------------------------------
class Block {
  Pixel* pixels;
  int width, height;
  Pixel getPixel(int, int);
  public:
    Block() {}
    void init(int, int);
    void set(int, int, char*);
    char* getRow(int);
    void rotate(int);
    // Pixel* upperLeftEdge ();
    // Pixel* upperRightEdge ();
    // Pixel* lowerLeftEdge ();
    // Pixel* lowerRightEdge ();
};

Pixel Block::getPixel(int x, int y){
  return pixels[y*width + x];
}

void Block::init (int w, int h) {
  width = w;
  height = h;
  pixels = new Pixel [w*h];
}

void Block::set (int x, int y, char* blockArray){
  //std::cout << x << " " << y << " " << blockArray[0] << std::endl; 
  pixels[width*y + x].set(blockArray[0], blockArray[1], blockArray[2], blockArray[3]);
}

char* Block::getRow(int rowNumber){
  Pixel* rowPixels = &pixels[rowNumber*width];
  char* returnArray = new char[width*4];
  for(int i=0; i < width; i++){
    char* pixel = rowPixels[i].get();
    returnArray[i*4] = pixel[0];
    returnArray[i*4+1] = pixel[1];
    returnArray[i*4+2] = pixel[2];
    returnArray[i*4+3] = pixel[3];
  }
  return returnArray;
}

void Block::rotate(int degrees){
  // x' = x * cos(a) + y * sin(a)
  // y' = y * cos(a) - x * sin(a)
  
  //create a temp array
  //rotate to that array
  //copy array values to old array
  //delete temp array
}

// ----------------------------------------------------
class Picture {
  Block* blocks;
  int width, height, blockWidth, blockHeight, blocksQty;

  public:
    Picture(int, int, int, int);
    void set(char*);
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


#endif
