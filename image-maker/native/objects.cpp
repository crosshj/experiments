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
    Block(int, int);
    void set(int, int, int*);
    void rotate(int);
    Pixel* upperLeftEdge ();
    Pixel* upperRightEdge ();
    Pixel* lowerLeftEdge ();
    Pixel* lowerRightEdge ();
};

Block::Block (int w, int h) {
  width = w;
  height = h;
  pixels = new Pixel [w*h];
}

void Block::set (int x, int y, int* blockArray){
  pixels[x*y].set(blockArray[0], blockArray[1], blockArray[2]);
}

// ----------------------------------------------------
class Picture {
  Block* blocks;
  int width, height, blockWidth, blockHeight;

  public:
    Picture(int, int, int, int);
    void set(int*);
    int* get();
  };

Picture::Picture (int w, int h, int bw, int bh) {
  width = w; height = h; blockWidth = bw; blockHeight = bh;
  std::fill_n(blocks, (w/bw)*(h/bh), Block(bw, bh));
}

void Picture::set (int* picArray) {
  int whichY = -1;
  for (int i = 0; i < width*height; i++) {
    int whichBlock = i%width/blockWidth + i/height/blockHeight*width/blockWidth;
    int whichX = (i%width)%(whichBlock%(width/blockWidth)*blockWidth);

    // LAME?? (or is the above lame??)
    // https://stackoverflow.com/questions/514637/is-it-more-efficient-to-branch-or-multiply
    if (i % height == 0){
      whichY++;
    }
    if (whichY > blockHeight){
      whichY = 0;
    }
    blocks[whichBlock].set(whichX, whichY, (int*)picArray[i*3]);
    
  }
}

int* Picture::get () {
  int* picArray;
  std::fill_n(picArray, width*height, 0);
  return picArray;
}


#endif
