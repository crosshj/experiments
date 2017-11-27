<script type="x-shader/x-vertex">
#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
uniform mat4 mMatrix;
uniform mat4 vMatrix;
uniform mat4 pMatrix;
varying vec2 vTextureCoord;
 
void main(void) {
        vTextureCoord = aTextureCoord;
        gl_Position =  pMatrix * vMatrix * mMatrix * vec4(aVertexPosition, 1.0);;
}
</script>