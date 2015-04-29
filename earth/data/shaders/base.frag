precision mediump float;
uniform sampler2D sTexture;
varying vec2 vTexCoord;
void main(void) {
    gl_FragColor = texture2D(sTexture, vTexCoord);
}
