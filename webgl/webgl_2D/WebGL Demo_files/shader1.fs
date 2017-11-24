<script type="x-shader/x-fragment">
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uColorTexture;
varying vec2 vTextureCoord;
 
void main(void) {
        vec4 tc = texture2D(uColorTexture, vTextureCoord);
        gl_FragColor  = vec4(tc.rgb, 1.0);
}
</script>