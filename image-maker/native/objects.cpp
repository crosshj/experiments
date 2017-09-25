#ifndef NATIVECHOP_H
#define NATIVECHOP_H

class Pixel {
  int red, green, blue;

  public:
    Pixel() {}
    void set(int, int, int);
};

void Pixel::set (int r, int g, int b) {
  red=r; green=g; blue=b;
}

class Block {
  Pixel* pixels;
  int width, height;

  public:
    //Block() {}
    Block(int, int);
    void set(int*);
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

void Block::set (int* blockArray){ }

class Picture {
  Block* blocks;
  int rows, height;

  public:
    //Picture() {}
    Picture(int, int, int, int);
    void set(int*);
  };

Picture::Picture (int r, int h, int bw, int bh) {
  rows = r; height = h;
  std::fill_n(blocks, r*h, Block(bw, bh));
}

void Picture::set (int* picArray) {}


#endif

