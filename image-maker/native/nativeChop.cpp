#include <nan.h>
using namespace Nan;  
using namespace v8;

NAN_METHOD(chop) {
	//TODO: defensive
	char * buffer = (char*) node::Buffer::Data(info[0]->ToObject());
	int size = (int) node::Buffer::Length(info[0]->ToObject());

	// int width = info[1]->Int32Value();
	// int height = info[2]->Int32Value();
	// int cropOriginX = info[3]->Int32Value();
	// int cropOriginY = info[4]->Int32Value();
	// int cropWidth = info[5]->Int32Value();
	// int cropHeight = info[6]->Int32Value();

	//TODO: pass in array of sources/targets here?
	
	char * retval = new char[size];
	for(int i = 0; i < size; i++ ) {
		retval[i] = (i%4 == 2) // noise blue channel
			? (char)((rand() % 256/4) + ((buffer[i] & 0xff) * 0.75))
			: (i%4 == 0 && (buffer[i] & 0xff) < 200) // enhance red channel
				? (char)((buffer[i] & 0xff) * 1.2) 
				: buffer[i]; // copy green/alpha
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
