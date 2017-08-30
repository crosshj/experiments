#include <nan.h>
using namespace Nan;  
using namespace v8;

NAN_METHOD(chop) {
	char* buffer = (char*) node::Buffer::Data(info[0]->ToObject());
	unsigned int size = info[1]->Uint32Value();
	//TODO: pass in array of sources/targets here?
	
	char * retval = new char[size];
	for(unsigned int i = 0; i < size; i++ ) {
		// FIX: not sure why this does not work right
		//retval[i] = (i%4 == 3) ? buffer[i] : (char)(buffer[i] * 0.9);
		retval[i] = buffer[i];
	}

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
