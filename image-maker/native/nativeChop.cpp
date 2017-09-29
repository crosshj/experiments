/*

http://www.puritys.me/docs-blog/article-286-How-to-pass-the-paramater-of-Node.js-or-io.js-into-native-C-C++-function..html

https://stackoverflow.com/questions/28658499/how-do-i-iterate-over-properties-in-an-object

see https://github.com/wadey/node-microtime for an example of native node module
setup with minimal extra code

native module buffers
https://community.risingstack.com/using-buffers-node-js-c-plus-plus/

cache buffer?
https://www.bennadel.com/blog/2681-turning-buffers-into-readable-streams-in-node-js.htm

hexagons
https://cboard.cprogramming.com/c-programming/165802-printing-hexagon-using-loops.html

*/

#include <time.h>
#include <iostream>

#include <nan.h>
#include <picture.h>


using namespace Nan;  
using namespace v8;

int rampColor(int value, double thresh){
	int ramped = value * thresh < 256
		? (int)(value * thresh)
		: value;
	return ramped;
}

int getGrid(int x, int y){
	int gridDim = 75;
	return (x % gridDim == y % gridDim || x % gridDim + y % gridDim == gridDim) ? 0 : 1;
}

NAN_METHOD(chop) {
	//TODO: defensive
	char * buffer = (char *) node::Buffer::Data(info[0]->ToObject());
	//int size = (int) node::Buffer::Length(info[0]->ToObject());

	int width = info[1]->Int32Value();
	int height = info[2]->Int32Value();
	int cropOriginX = info[3]->Int32Value();
	int cropOriginY = info[4]->Int32Value();
	int cropWidth = info[5]->Int32Value();
	int cropHeight = info[6]->Int32Value();
	int size = cropHeight * cropWidth * 4;

	//TODO: pass in array of sources/targets here?

	char * retval = new char[size];
	
	// crop and apply filter
	for (int y = 0; y < cropHeight && y < height; y++) {
		for (int x = 0; x < cropWidth; x++) {
			int metaidx = (width * (y + cropOriginY) + x + cropOriginX) << 2;
			int idx = (cropWidth * y + x) << 2;
			int grid = getGrid(x, y);

			retval[idx] = (grid == 0)
				? 128
				: rampColor(buffer[metaidx] & 0xff, 1.175);
			retval[idx + 1] = (grid == 0)
				? 128
				: rampColor(buffer[metaidx + 1] & 0xff, 1.071);
			retval[idx + 2] = (grid == 0)
				? 128
				: (char)((rand() % 256/4) + ((buffer[metaidx + 2] & 0xff) * 0.75));
			retval[idx + 3] = buffer[metaidx + 3];
		}
	}
	
	//TODO: OR do chopping here

	info.GetReturnValue().Set(
		Nan::NewBuffer(retval, size).ToLocalChecked()
	);
}

NAN_METHOD(test) {
	char * buffer = (char *) node::Buffer::Data(info[0]->ToObject());
	int width = info[1]->Int32Value();
	int height = info[2]->Int32Value();
	int blockWidth = info[3]->Int32Value();
	int blockHeight = info[4]->Int32Value();
	int rotate = info[5]->Int32Value();
	int size = height * width * 4;

	srand ( (unsigned int)time(NULL) ); //initialize the random seed
	const int degrees[3] = {'90', '180', '270'};

	Picture* pic = new Picture(width, height, blockWidth, blockHeight);
	pic->set(buffer);

	if (rotate < 2){
		pic->rotateBlock(0, 360);
	} else {
		for (int i=0; i< rotate; i++ ){
			int swapOne = rand() % (height/blockHeight * width/blockWidth);
			int swapTwo = swapOne;
			while (swapOne == swapTwo){
				swapTwo = rand() % (height/blockHeight * width/blockWidth);
			}
			pic->swapBlocks(swapOne, swapTwo);

			int randIndex = rand() % (height/blockHeight * width/blockWidth);
			pic->rotateBlock(randIndex, 90);

			//int randIndex = rand() % (height/blockHeight * width/blockWidth);
			// pic->rotateBlock(i, degrees[randIndex]);
		}
	}
	char* retVal = pic->get();
	
	info.GetReturnValue().Set(
		Nan::NewBuffer(retVal, size).ToLocalChecked()
	);
}

NAN_MODULE_INIT(init) {  
	Nan::Set(
		target,
		New<String>("chop").ToLocalChecked(),
		GetFunction(New<FunctionTemplate>(chop)).ToLocalChecked()
	);
	Nan::Set(
		target,
		New<String>("test").ToLocalChecked(),
		GetFunction(New<FunctionTemplate>(test)).ToLocalChecked()
	);
}

NODE_MODULE(nativeChop, init);
