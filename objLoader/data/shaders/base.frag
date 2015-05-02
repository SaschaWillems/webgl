precision mediump float;

uniform sampler2D sTexture;

varying vec2 vTexCoord;
varying vec3 vNormal;

void main(void) {
    gl_FragColor = texture2D(sTexture, vTexCoord);
}
