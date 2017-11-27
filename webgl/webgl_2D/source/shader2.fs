<script id="shader-fs" type="x-shader/x-fragment">
#ifdef GL_ES
precision mediump float;
#endif

vec2 lightLocation = vec2(200,200); 
vec3 lightColor = vec3(1.0,1.0,0);
float screenHeight;

void main() {
    float distance = length(lightLocation - gl_FragCoord.xy);
    float attenuation = 20.0/distance - clamp(- pow(distance - 3.0, 0.44) + 4.3, 0.0, 1.0) /2.0;
    vec4 color = vec4(0.2, attenuation, attenuation, attenuation) * vec4(lightColor, 1);

    gl_FragColor = color;
}
</script>