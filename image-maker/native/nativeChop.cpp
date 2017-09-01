/*

http://www.puritys.me/docs-blog/article-286-How-to-pass-the-paramater-of-Node.js-or-io.js-into-native-C-C++-function..html

https://stackoverflow.com/questions/28658499/how-do-i-iterate-over-properties-in-an-object

see https://github.com/wadey/node-microtime for an example of native node module
setup with minimal extra code

native module buffers
https://community.risingstack.com/using-buffers-node-js-c-plus-plus/

cache buffer?
https://www.bennadel.com/blog/2681-turning-buffers-into-readable-streams-in-node-js.htm

*/

#include <nan.h>
using namespace Nan;  
using namespace v8;

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

			// retval[idx] = (((buffer[metaidx] & 0xff) * 1.4) < 255)
			// 	? (int)((buffer[metaidx] & 0xff) * 1.1)
			// 	: buffer[metaidx];

			float thresh = 1.175;
			int redValue = buffer[metaidx] & 0xff;
			int redRamped = ((redValue * thresh) < 256)
						? redValue * thresh
						: buffer[metaidx];
 
			// if (redValue == 210 & x < 1000){
			// 	printf("--- original: %d, new: %d, maybe: %d\n", redValue, redRamped, redValue * thresh);
			// }

			retval[idx] = redRamped;
			retval[idx + 1] = buffer[metaidx + 1];
			retval[idx + 2] = (char)((rand() % 256/4) + ((buffer[metaidx + 2] & 0xff) * 0.75));
			retval[idx + 3] = buffer[metaidx + 3];
		}
	}
	
	//TODO: OR do chopping here

	info.GetReturnValue().Set(
		Nan::NewBuffer(retval, size).ToLocalChecked()
	);
}

NAN_MODULE_INIT(init) {  
	Nan::Set(
		target,
		New<String>("chop").ToLocalChecked(),
		GetFunction(New<FunctionTemplate>(chop)).ToLocalChecked()
	);
}

NODE_MODULE(nativeChop, init);
