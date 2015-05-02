attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
varying vec2 vTexCoord;
varying vec3 vNormal;

void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vNormal = aNormal;
    vTexCoord = aTextureCoord;
    vTexCoord.t = 1.0 - vTexCoord.t;
}
