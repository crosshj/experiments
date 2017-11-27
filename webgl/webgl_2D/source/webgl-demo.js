var canvas;
var gl;
var squareVerticesBuffer;
var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var perspectiveMatrix;

//
// start
//
// Called when the canvas is created to get the ball rolling.
// Figuratively, that is. There's nothing moving in this demo.
//
function start() {
  canvas = document.getElementById("glcanvas");

  initWebGL(canvas);      // Initialize the GL context
  
  // Only continue if WebGL is available and working
  
  if (gl) {
	 var bgColor = [ 0.0, 0.0, 0.0, 1.0 ];

    gl.clearColor(bgColor[0],bgColor[1],bgColor[2],bgColor[3]);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    
    // Initialize the shaders; this is where all the lighting for the
    // vertices and so forth is established.
    
    initShaders();
    
    // Here's where we call the routine that builds all the objects
    // we'll be drawing.
    
    initBuffers();
    
    // Set up to draw the scene periodically.
    
    setInterval(drawScene, 15);
  }
}

//
// initWebGL
//
// Initialize WebGL, returning the GL context or null if
// WebGL isn't available or could not be initialized.
//
function initWebGL() {
  gl = null;
  
  try {
    gl = canvas.getContext("experimental-webgl");
  }
  catch(e) {
  }
  
  // If we don't have a GL context, give up now
  
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }
}

function getVertices() {
window.vertices = [
    0.015,  0.015,  0.0,
    -0.015, 0.015,  0.0,
    0.015,  -0.015, 0.0,
    -0.015, -0.015, 0.0
  ];

/*  v = 6.4;
  w = 2.5;
  v/=2;
  w/=2;

  var vertices = [
     v, w, 0.0,
    -v, w, 0.0,
     v,-w, 0.0,
    -v,-w, 0.0
  ];*/

  var w=630;
  var h=470;
  var x=10;
  var y=10;
  vertices = [
     w, h, 1.0,
     x, h, 1.0,
     w, y, 1.0,
     x, y, 1.0
  ];

  vertices = JSON.parse(model_source).vertices;
  //var min = Math.min.apply(null,vertices);
  //vertices = vertices.map(function(val,index,array){ return (val-min)*100; });
  //var max = Math.max.apply(null,vertices);
  //vertices = vertices.map(function(val,index,array){ return ((index+1)%3) ?  val : val-max ; });
  vertices = vertices.map(function(val,index,array){ return val*300 ; });
  console.log(vertices);
  return vertices;

}



//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just have
// one object -- a simple two-dimensional square.
//
function initBuffers() {
  
  // Create a buffer for the square's vertices.
  
  squareVerticesBuffer = gl.createBuffer();
  
  // Select the squareVerticesBuffer as the one to apply vertex
  // operations to from here out.
  
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);


  // Now create an array of vertices for the square. Note that the Z
  // coordinate is always 0 here.
  
  var vertices = getVertices();
  
  // Now pass the list of vertices into WebGL to build the shape. We
  // do this by creating a Float32Array from the JavaScript array,
  // then use it to fill the current vertex buffer.
  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


  window.FacesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, FacesBuffer);
  var faces = JSON.parse(model_source).faces;  
  console.log(faces);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(faces), gl.STATIC_DRAW);
}

//
// drawScene
//
// Draw the scene.
//
function drawScene() {
  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // Establish the perspective with which we want to view the
  // scene. Our field of view is 45 degrees, with a width/height
  // ratio of 640:480, and we only want to see objects between 0.1 units
  // and 100 units away from the camera.
  
  //makeOrtho(left, right,bottom, top,znear, zfar)
  perspectiveMatrix = makeOrtho(-600, 639,-500, 479,-500, 500);
  //perspectiveMatrix = makePerspective(45, 480.0/640.0, 0.1, 100.0);
  
  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  
  loadIdentity();
  
  // Now move the drawing position a bit to where we want to start
  // drawing the square.
  
  //mvTranslate([0.0, 0.0, -100]);
  
  // Draw the square by binding the array buffer to the square's vertices
  // array, setting attributes, and pushing it to GL.
  
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, FacesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, vertices.length/3, gl.UNSIGNED_SHORT, 0);
  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length/3);
}

//
// initShaders
//
// Initialize the shaders, so WebGL knows how to light our scene.
//
function initShaders() {
  //var fragmentShader = getShader(gl, "shader-fs");
  //var vertexShader = getShader(gl, "shader-vs");
  var fragmentShader = compileShader(fs_source,"frag");
  var vertexShader = compileShader(vs_source,"vert");

  // Create the shader program
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  
  // If creating the shader program failed, alert
  
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
  }
  
  gl.useProgram(shaderProgram);
  
  vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(vertexPositionAttribute);
}

//
// getShader
//
// Loads a shader program by scouring the current document,
// looking for a script with the specified ID.
//
function getShader(gl, id) {
  var shaderScript = document.getElementById(id);
  
  // Didn't find an element with the specified ID; abort.
  
  if (!shaderScript) {
    return null;
  }
  
  // Walk through the source element's children, building the
  // shader source string.
  
  var theSource = "";
  var currentChild = shaderScript.firstChild;
  
  while(currentChild) {
    if (currentChild.nodeType == 3) {
      theSource += currentChild.textContent;
    }
    
    currentChild = currentChild.nextSibling;
  }
  
  // Now figure out what type of shader script we have,
  // based on its MIME type.
  
  var shader;
  
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;  // Unknown shader type
  }
  
  // Send the source to the shader object
  
  gl.shaderSource(shader, theSource);
  
  // Compile the shader program
  
  gl.compileShader(shader);
  
  // See if it compiled successfully
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    return null;
  }
  
  return shader;
}

function compileShader(source, type){
  var shader;
  
  if (type == "frag") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (type =="vert") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    console.log("Unknown shader type");
    return null;  // Unknown shader type
  }
  
  // Send the source to the shader object
  
  gl.shaderSource(shader, source);
  
  // Compile the shader program
  
  gl.compileShader(shader);
  
  // See if it compiled successfully
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    return null;
  }
  
  return shader;
}

//
// Matrix utility functions
//

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}