precision mediump float;
uniform sampler2D sTexture;
uniform int Orientation;
varying vec2 vTexCoord;
uniform vec2 uShift;
const int gaussRadius = 11;
void main(void) {
  vec2 texCoord = vTexCoord.st - float(int(gaussRadius/2)) * uShift;
  vec3 color = vec3(0.0, 0.0, 0.0);
  float gaussFilter[11];
  gaussFilter[0] = 0.0402; gaussFilter[1] = 0.0623; gaussFilter[2] = 0.0877;
  gaussFilter[3] = 0.1120; gaussFilter[4] = 0.1297; gaussFilter[5] = 0.1362;
  gaussFilter[6] = 0.1297; gaussFilter[7] = 0.1120; gaussFilter[8] = 0.0877;
  gaussFilter[9] = 0.0623; gaussFilter[10] = 0.0402;
  for (int i=0; i<gaussRadius; ++i) {
    color += gaussFilter[i] * texture2D(sTexture, texCoord).xyz;
    texCoord += uShift;
  }
  gl_FragColor = vec4(color,1.0);
}
