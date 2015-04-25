/**
*
*
* @licstart  The following is the entire license notice for the
* JavaScript code in this page.
*
* Copyright (C) 2015 by Sascha Willems (www.saschawillems.de)
*
* Source can be found at https://github.com/SaschaWillems
*
* The JavaScript code in this page is free software: you can
* redistribute it and/or modify it under the terms of the GNU
* General Public License (GNU GPL) as published by the Free Software
* Foundation, either version 3 of the License, or (at your option)
* any later version.  The code is distributed WITHOUT ANY WARRANTY;
* without even the implied warranty of MERCHANTABILITY or FITNESS
* FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this page.
*
*/

function buffers() {
  var vertices = null;
  var textureCoords = null;
  var normals = null;
  var instancingOffsets = null;
  var instancingColors = null;
}

function shaders() {
  var planet = null;
}

function textures() {
  var colorMapDay = null;
  var colorMapNight = null;
}

function generateArrayBuffer(data, type, itemsize) {
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, type);
  buffer.itemSize = itemsize;
  buffer.numItems = data.length / itemsize;
  return buffer;
}

var instanceCount = 0;
var shaderDegreeTimer = 0;
var rotation = 0;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var uNormalMatrix = mat3.create();

function generateSphere(radius, detail) {
  // Based on Paul Bourke's geometry article
  var vertices = [];
  var normals = [];
  var texcoords = [];

  var TWOPI = 6.28318530717958;
  var PIDIV2 = 1.57079632679489;

  var p = detail;
  var r = radius;
  var cx = 0;
  var cy = 0;
  var cz = 0;

   for( var i = 0; i < p/2; ++i )
   {

       var theta1 = i * TWOPI / p - PIDIV2;
       var theta2 = (i + 1) * TWOPI / p - PIDIV2;

       for(var j = 0; j <= p; ++j )
       {
           var theta3 = j * TWOPI / p;

           var ex = Math.cos(theta2) * Math.cos(theta3);
           var ey = Math.sin(theta2);
           var ez = Math.cos(theta2) * Math.sin(theta3);
           var px = cx + r * ex;
           var py = cy + r * ey;
           var pz = cz + r * ez;
           var tu  = -(j/p);
           var tv  = 2*(i+1)/p;

          vertices.push(px, py, pz);
          normals.push(ex, ey, ez);
          texcoords.push(tu, -tv);

           ex = Math.cos(theta1) * Math.cos(theta3);
           ey = Math.sin(theta1);
           ez = Math.cos(theta1) * Math.sin(theta3);
           px = cx + r * ex;
           py = cy + r * ey;
           pz = cz + r * ez;
           tu  = -(j/p);
           tv  = 2*i/p;

           vertices.push(px, py, pz);
           normals.push(ex, ey, ez);
           texcoords.push(tu, -tv);
       }
   }

  // Setup buffers
  buffers.vertices = generateArrayBuffer(new Float32Array(vertices), gl.STATIC_DRAW, 3)
  buffers.textureCoords = generateArrayBuffer(new Float32Array(texcoords), gl.STATIC_DRAW, 2)
  buffers.normals = generateArrayBuffer(new Float32Array(normals), gl.STATIC_DRAW, 3)
}

function generateInstancingBuffers(dimensionCount, offset) {
  var offsets = [];
  var colors = [];

  // Generate a three dmensional grid for our instanced positions
  var dim = dimensionCount;
  instanceCount = 0;
  for (var x = 0; x < dim; x++) {
    for (var y = 0; y < dim; y++) {
      for (var z = 0; z < dim; z++) {
        offsets.push(x*offset - ((offset * dim / 2)) + 0.5, y*offset - ((offset * dim / 2)), -z);
        colors.push(0.75 + Math.random()*0.25, 0.75 + Math.random()*0.25, 0.75 + Math.random()*0.25, 1.0);
        instanceCount++;
      }
    }
  }

  console.log("instanceCount = " + instanceCount);
  console.log("tris = " + (instanceCount * buffers.vertices.numItems / 3));

  // Setup instacing buffers for position offsets and color
  buffers.instancingOffsets = generateArrayBuffer(new Float32Array(offsets), gl.STATIC_DRAW, 3)
  buffers.instancingColors = generateArrayBuffer(new Float32Array(colors), gl.STATIC_DRAW, 4)
}

function loadShaders() {
  shaders.planet = loadShader("shader-globe-vs", "shader-globe-fs");

  shaders.planet.vertexPositionAttribute = gl.getAttribLocation(shaders.planet, "aVertexPosition");
  shaders.planet.normalAttribute = gl.getAttribLocation(shaders.planet, "aNormal");
  shaders.planet.texcoordAttribute = gl.getAttribLocation(shaders.planet, "aTextureCoord");
  shaders.planet.offsetLocation = gl.getAttribLocation(shaders.planet, "aInstancedOffset");
  shaders.planet.colorLocation = gl.getAttribLocation(shaders.planet, "aInstancedColor");

  shaders.planet.pMatrixUniform = gl.getUniformLocation(shaders.planet, "uPMatrix");
  shaders.planet.mvMatrixUniform = gl.getUniformLocation(shaders.planet, "uMVMatrix");
  shaders.planet.normalMatrixUniform = gl.getUniformLocation(shaders.planet, "uNormalMatrix");

}
