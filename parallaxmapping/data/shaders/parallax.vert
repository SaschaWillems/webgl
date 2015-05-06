/*
Copyright (C) 2015 by Sascha Willems (www.saschawillems.de)

Source can be found at https://github.com/SaschaWillems

The JavaScript code in this page is free software: you can
redistribute it and/or modify it under the terms of the GNU
General Public License (GNU GPL) as published by the Free Software
Foundation, either version 3 of the License, or (at your option)
any later version.  The code is distributed WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
*/

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aTangent;
attribute vec3 aBinormal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNormalMatrix;
uniform vec3 uLightPos;
uniform vec3 uCameraPos;

varying vec2 vTexCoord;
varying vec3 vNormal;

varying vec3 vLightVec;
varying vec3 vLightVecB;
varying vec3 vSpecular;

varying vec3 eyeVec;
varying vec3 lightDir;
varying vec3 vViewVec;

void main(void) {

    vec3 vertexPosition = vec3(uMVMatrix *  vec4(aVertexPosition, 1.0));
  	lightDir = normalize(uLightPos - vertexPosition);

    // Calculate binormal on the fly
    vec3 binormal = cross(aNormal, aTangent);
    // Setup (t)angent-(b)inormal-(n)ormal matrix for converting
    // object coordinates into tangent space
    mat3 tbnMatrix;
    tbnMatrix[0] =  uNormalMatrix * aTangent;
    tbnMatrix[1] =  uNormalMatrix * binormal;
    tbnMatrix[2] =  uNormalMatrix * aNormal;

    eyeVec = vec3(-vertexPosition) * tbnMatrix;

    vLightVec.xyz = vec3(uLightPos - vertexPosition.xyz) * tbnMatrix;

    vec3 lightDist = uLightPos.xyz - aVertexPosition.xyz;
    vLightVecB.x = dot(aTangent.xyz, lightDist);
    vLightVecB.y = dot(binormal.xyz, lightDist);
    vLightVecB.z = dot(aNormal, lightDist);

    vec3 camPos = vec3(uNormalMatrix * uCameraPos);

    vec3 camVec = camPos - aVertexPosition.xyz;
    vViewVec.x = dot(aTangent, camVec);
    vViewVec.y = dot(binormal, camVec);
    vViewVec.z = dot(aNormal, camVec);

    vec3 reflectVec = reflect(-camVec, aNormal);
    vec3 vViewVec = lightDir;
    float specIntensity = pow(max(dot(reflectVec, vViewVec), 0.0), 8.0);
    vSpecular = vec3(specIntensity * 0.3);

    vTexCoord = aTextureCoord;

    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
