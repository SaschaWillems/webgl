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

precision mediump float;

uniform sampler2D sColorMap;
uniform sampler2D sNormalMap;
uniform sampler2D sHeightMap;

uniform int uUsePom;
uniform int uDisplayNormalMap;

uniform float uScale;
uniform float uBias;

varying vec2 vTexCoord;
varying vec3 vNormal;

varying vec3 vLightVec;
varying vec3 vLightVecB;
varying vec3 vSpecular;
varying vec3 vViewVec;

varying vec3 eyeVec;
varying vec3 lightDir;

void main(void) {

  vec3 specularColor = vec3(0.0, 0.0, 0.0);

  float invRadius = 1.0/0.5;
  float ambient = 0.25;

  vec3 rgb, normal, total, eyevects;
  vec2 newtexcoord;

  eyevects = normalize(eyeVec).xyz;

  // Get new scaled and biaed texture coordinates
  vec2 height_bump = vec2(texture2D(sHeightMap, vTexCoord).r * uScale + uBias, 0.0);

  if (uUsePom == 1) {
    newtexcoord.xy = vTexCoord + (height_bump.x * normalize(eyeVec).xy);
  } else {
    newtexcoord.st = vTexCoord;
  }

  if (uDisplayNormalMap == 0) {
    rgb = texture2D(sColorMap, newtexcoord.xy).xyz;
  } else {
    rgb = texture2D(sNormalMap, newtexcoord.xy).xyz;
  }

  normal = normalize((texture2D(sNormalMap, newtexcoord.xy).xyz - 0.5) * 2.0);

  eyevects = normalize(vLightVec).xyz;
  height_bump.y = min(dot(normal, eyevects.xyz), 1.0);
  height_bump.y = pow(height_bump.y, 8.0);
  total = clamp(height_bump.y * specularColor.xyz,0.0,1.0);

  float distSqr = dot(vLightVecB, vLightVecB);
  vec3 lVec = vLightVecB * inversesqrt(distSqr);

  vec3  nvViewVec = normalize(vViewVec);
  float specular = pow(clamp(dot(reflect(-nvViewVec, normal), lVec), 0.0, 1.0), 4.0);

  float atten = clamp(1.0 - invRadius * sqrt(distSqr), 0.0, 1.0);
  float diffuse = clamp(dot(lVec, normal), 0.0, 1.0);

  gl_FragColor = vec4((rgb * ambient + (diffuse * rgb + 0.5 * specular * specularColor.rgb)) * atten, 1.0);
}
