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

function vertexBufferObject() {
  this.vertices = null;
  this.textureCoords = null;
  this.normals = null;
  this.colors = null;
  this.shaderAttribPosVertices = 0;
  this.shaderAttribPosTextureCoords = 0;
  this.shaderAttribPosNormals = 0;
  this.shaderattribPosColors = 0;

  this.setVertices = function(vertexArray, attribPos) {
    this.shaderAttribPosVertices = attribPos;
    this.vertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW);
    this.vertices.itemSize = 3;
    this.vertices.numItems = vertexArray.length / 3;
  };

  this.setTextureCoordinates = function(coordinateArray, attribPos, itemsize) {
    this.shaderAttribPosTextureCoords = attribPos;
    this.textureCoords = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoords);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coordinateArray), gl.STATIC_DRAW);
    this.textureCoords.itemSize = itemsize;
    this.textureCoords.numItems = coordinateArray.length / itemsize;
  };

  this.setNormals = function(normalArray, attribPos) {
    this.shaderAttribPosNormals = attribPos;
    this.normals = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normals);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalArray), gl.STATIC_DRAW);
    this.normals.itemSize = 3;
    this.normals.numItems = normalArray.length / 3;
  };

  this.setColors = function(colorArray, attribPos) {
    this.shaderattribPosColors = attribPos;
    this.colors = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colors);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorArray), gl.STATIC_DRAW);
    this.colors.itemSize = 4;
    this.colors.numItems = colorArray.length / 4;
  };

  this.render = function(primitiveType) {
    if (this.textureCoords) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoords);
      gl.vertexAttribPointer(this.shaderAttribPosTextureCoords, this.textureCoords.itemSize, gl.FLOAT, false, 0, 0);
    }
    if (this.normals) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normals);
      gl.vertexAttribPointer(this.shaderAttribPosNormals, this.normals.itemSize, gl.FLOAT, false, 0, 0);
    }
    if (this.colors) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.colors);
      gl.vertexAttribPointer(this.shaderattribPosColors, this.colors.itemSize, gl.FLOAT, false, 0, 0);
    }
    if (this.vertices) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices);
      gl.vertexAttribPointer(this.shaderAttribPosVertices, this.vertices.itemSize, gl.FLOAT, false, 0, 0);
      gl.drawArrays(primitiveType, 0, this.vertices.numItems);
    }
  };

}
