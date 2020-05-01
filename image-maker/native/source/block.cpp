#include <block.h>
#define BW false

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
    if(BW){
      char pixelBW = rowPixels[i].getBW();
      returnArray[i*4] = pixelBW;
      returnArray[i*4+1] = pixelBW;
      returnArray[i*4+2] = pixelBW;
      returnArray[i*4+3] = (char)255;
    } else {
      returnArray[i*4] = pixel[0];
      returnArray[i*4+1] = pixel[1];
      returnArray[i*4+2] = pixel[2];
      returnArray[i*4+3] = pixel[3];
      delete[] pixel;
    }
  }
  return returnArray;
}

// another solution - https://stackoverflow.com/questions/848025/rotating-bitmaps-in-code
// https://stackoverflow.com/questions/42519/how-do-you-rotate-a-two-dimensional-array
void Block::rotate(int degrees){
  //TODO: defensive - right angles rotate, ie. only 90, 180, 270

  //TODO: defensive - block must be square dimensions

  //create a temp array
  Pixel* tempPixels = new Pixel [width*height];

  for (int d=degrees; d > 0; d = d-90){
    //rotate to that array
    for(int x=0; x < width; x++){
      for(int y=0; y < height; y++){
        int newX = width - y -1;
        int newY = x;
        char* oldPixel = getPixel(x, y).get();
        tempPixels[newY*width + newX].set(oldPixel[0], oldPixel[1], oldPixel[2], oldPixel[3]);
        delete[] oldPixel;
      }
    }

    //copy array values to old array
    for(int i = 0; i < width*height; i++){
      char* tempPixel = tempPixels[i].get();
      pixels[i].set(tempPixel[0], tempPixel[1], tempPixel[2], tempPixel[3]);
      delete[] tempPixel;
    }
  }

  //delete temp array
  delete[] tempPixels;
}

Pixel* Block::northEdge (){
  Pixel* edge = new Pixel[width];
  for(int i = 0; i < width; i++){
    edge[i] = pixels[i];
  }
  return edge; 
}

Pixel* Block::southEdge (){
  Pixel* edge = new Pixel[width];
  int offset = (height-1)*width + 1;
  for(int i = 0; i < width; i++){
    edge[i] = pixels[i+offset];
  }
  return edge; 
}

Pixel* Block::eastEdge (){
  Pixel* edge = new Pixel[height];
  int currentEdgeItem = 0;
  for(int i = 0; i < height*width; i++){
    if(i%width == width -1){
      edge[currentEdgeItem] = pixels[i];
      currentEdgeItem++;
    }
  }
  return edge;
}

Pixel* Block::westEdge (){
  Pixel* edge = new Pixel[height];
  int currentEdgeItem = 0;
  for(int i = 0; i < height*width; i++){
    if(i%width == 0){
      edge[currentEdgeItem] = pixels[i];
      currentEdgeItem++;
    }
  }
  return edge;
}
