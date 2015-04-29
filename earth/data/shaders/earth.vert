attribute vec4 aVertexPosition;
attribute vec3 aNormal;
attribute vec2 aTextureCoord;

uniform float cos_time_0_2PI;
uniform float sin_time_0_2PI;
uniform mat4 uPMatrix;
uniform mat4 uMVMatrix;
uniform mat3 uNormalMatrix;
uniform float season;

varying float vDiffuse;
varying vec3 vSpecular;
varying vec2 vTexCoord;
varying float vAtmo;

void main(void)
{
    // calculate vertex position in eye coordinates
    vec4 ecPosition = uMVMatrix * aVertexPosition;

    vec3 normal = normalize(uNormalMatrix * aNormal);

    // compute the light vector pointing toward the sun, in model coordinates
    // x,y compose the longitude and z the (seasonal) lattitude of the nadir point.
    vec3 lightVec = normalize(uNormalMatrix * vec3(cos_time_0_2PI, season, sin_time_0_2PI));

    vec3 reflectVec = reflect(-lightVec, normal);
    vec3 viewVec = normalize(vec3 (-ecPosition));

    // Calculate specular light intensity, scale down and apply a slightly yellowish tint.
    float specIntensity = pow(max(dot(reflectVec, viewVec), 0.0), 8.0);
    vSpecular = (specIntensity * 0.3) * vec3 (1.0, 0.941, 0.898);

    // Calculate a diffuse light intensity
    vDiffuse = dot(lightVec, normal);

    float factor = 1.5;
//        float factor = 1.25;
    float Dot = factor*dot(normal, reflectVec) + factor;
    vAtmo = 1.0 - abs(dot(viewVec, normal)) * Dot;


    vTexCoord = aTextureCoord;
    gl_Position = uPMatrix * uMVMatrix * aVertexPosition;
}
