
# let's write C with javascript!

Here's a crazy idea.  Read on!

## motivation
I have been helping a student that is taking a class that requires C.

In helping, I realized that there are things that I like about C and others which I prefer JS.  Quick example, C is compiled code and can potentially run faster and use less memory than the same JS code.

I began wondering why I couldn't paste simple javascript code into a C program and have it run; it's very similar in some sense.


## roadblocks
Here are a few reasons why this cannot happen:

1) types: C doesn't let you be loose about this
2) functions: C has a means of having variable arguments, but it's not as loose as javascript
3) dependencies: #include versus require or import
3) ... (more to follow)

Still, I didn't feel like giving up.  I started with `console.log`.  There should be a way to make this work and there was.  I got pretty far (have a look at the code).  Ultimately, there was no way to get C to parse a typical `console.log` usage the way that a JS engine would.

Variatic functions were where I stopped.  I could have my C `console.log` either accept a first arguement with number of args OR I could include a final dummy argument which my function would take as a sign to stop getting arguments.


## possible solutions
Then I started thinking that transpiling might help.  Here's some information on that.

https://kentcdodds.com/blog/write-your-own-code-transform
https://itnext.io/introduction-to-custom-babel-plugins-98a62dad16ee

The idea I have is that a babel plugin could be written to transform my modified C into standard C + library functions which understood `console.log` for example.


## future
For that matter, what if my C code had all the cool things that my JS ecosystem has: package management, transpiling, (better) build systems, and more? 

I realize there are efforts and arguments against these suggestions.  For example, there are already people trying to make package management work with C (NOTE: share these).  Also, there has been a ton of effort to make building C code better.  One could argue that C builds ARE better than JS builds.  

However, what I have in mind is different.  Use JS ecosystem solutions for all of these, but ultimately the program that gets built will be a C program.  And I am fully aware that C++ already exists alongside JS, native modules.

To me, this seems like a fun exercise, but also a pain in the ass.  I am not sure how far I will go with this, but I have been meaning to understand babel plugins better.

All that said, transpiling worked to make JSX a hit! And npm has been wonderful for the node community.  I wonder how well node ecosystem would adapt to C code.

## rubber to the road (transpiling with babel)

Here's an example of a babel plugin that would add an empty string argument to all `console.log` calls.  Also, `console.log` could be changed to something like `myConsoleLog` (see commented code).

See it live at: [AST explorer](https://astexplorer.net/#/gist/efd7bf03421958d48b76b485df3992e4/aca807a582baec56dde692f69107667ededbbe8a)

```
export default function(babel) {
  const { types: t } = babel;

  return {
    visitor: {
      MemberExpression(path){
        if (
          path.node.object.name === 'console' &&
          path.node.property.name === 'log'
        ) {
          //path.replaceWithSourceString("myConsoleLog");
          path.parentPath.node.arguments
            .push(
              t.stringLiteral('')
            )
        }
      }
      
    }
  };
};
```

so this:
```
console.log('foo');
```

would become this:
```
console.log('foo', "");
```

This is just one small step.  Obviously, all the functionality of console.log does not come along for the ride.  For one, this just covers strings and does not handle objects.  But do we have to have all that?  Not sure.

## next steps

The package.json for this project already uses nodemon to instruct make to compile and run the c code already in place.  

Could we get babel to translate the code before make takes over?

Could the library code for `console.log` be included without the main program having knowledge of it?

What about `scanf` or `strcmp`?  Maybe `scanf` could be replaced with `prompt`, but `strcmp` needs to know what kind of variable it is scanning.

How far can this go without creating a complicated mess?
