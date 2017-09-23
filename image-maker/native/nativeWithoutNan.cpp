/*
use with binding.gyp:

{
    "targets": [{
        "target_name": "nativeChop",
        "sources": ["nativeChop.cpp"]
    }]
}

*/


#include <v8.h>
#include <node.h>

using namespace node;
using namespace v8;
using namespace std;

void ChopResults(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  // Make sure there is an argument.
  if (args.Length() != 1) {
      isolate->ThrowException(Exception::TypeError(
          String::NewFromUtf8(isolate, "Need an argument")));
      return;
  }

  // Make sure it's an array.
  if (! args[0]->IsArray()) {
      isolate->ThrowException(Exception::TypeError(
          String::NewFromUtf8(isolate, "First argument needs to be an array")));
      return;
  }

  // Unpack JS array into a std::vector
  vector<int> values;
  Local<Array> input = Local<Array>::Cast(args[0]);
  unsigned int numValues = input->Length();

  // Make sure it's an array.
  if (numValues % 4 != 0) {
      isolate->ThrowException(Exception::TypeError(
          String::NewFromUtf8(isolate, "Array length must be multiple of 4 (rgba)")));
      return;
  }

  // format to be operated on in this module
  for (unsigned int i = 0; i < numValues; i++) {
    values.push_back(input->Get(i)->NumberValue());
  }

  // TODO: do something with values before converting back

  // Reformat to go back to JS
  Local<Array> pixels = Array::New(isolate);
  Local<Array> data = Array::New(isolate);
  for (unsigned int i = 0; i < numValues; i+=4 ) {
      data->Set(i, Number::New(isolate, values[i]));
      data->Set(i+1, Number::New(isolate, values[i+1]));
      data->Set(i+2, Number::New(isolate, values[i+2]));
      data->Set(i+3, Number::New(isolate, values[i+3]));

      Local<Object> node = Object::New(isolate);
      node->Set(String::NewFromUtf8(isolate, "red"), Number::New(isolate, values[i]));
      node->Set(String::NewFromUtf8(isolate, "green"), Number::New(isolate, values[i+1]));
      node->Set(String::NewFromUtf8(isolate, "blue"), Number::New(isolate, values[i+2]));
      node->Set(String::NewFromUtf8(isolate, "alpha"), Number::New(isolate, values[i+3]));
      pixels->Set(i/4, node);
  }

  Local<Object> result = Object::New(isolate);
  result->Set(String::NewFromUtf8(isolate, "pixels"), pixels);
  result->Set(String::NewFromUtf8(isolate, "data"), data);
  args.GetReturnValue().Set(result);
}

void init(Local<Object> target) {
  NODE_SET_METHOD(target, "chop", ChopResults);
}

NODE_MODULE(binding, init);