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

function ObjLoader() {
  this.vertices = [];
  this.normals = [];
  this.texCoords = [];
  this.indices = [];

  this.normalBuffer;
  this.texCoordBuffer;
  this.vertexBuffer;

  this.texCoorDim = 0;

  this.colorMap = null;
  this.shader = null;

  this.generateBuffer = function(type, data, itemSize) {
   var buffer = gl.createBuffer();
   var arrayView = type === gl.ARRAY_BUFFER ? Float32Array : Uint16Array;
   gl.bindBuffer(type, buffer);
   gl.bufferData(type, new arrayView(data), gl.STATIC_DRAW);
   buffer.itemSize = itemSize;
   buffer.numItems = data.length / itemSize;
   return buffer;
 }

  this.splitLineToFloats = function(line)  {
    var values = [];
    var split = line.split(' ');
    for (var i = 0; i < split.length; i++) {
      var value = parseFloat(split[i]);
      if (!isNaN(value)) {
        values.push(value);
      }
    }
    return values;
  }

  this.splitFace = function(line) {
    // Line defines indices for one triangle
    // f 1/1/1 2/10/2 3/11/3
    var values = [];
    var split = line.split(' ');
    for (var i = 1; i < split.length; i++) {
      var splitFace = split[i].split('/');
      for (var j = 0; j < splitFace.length; j++) {
        var value = parseFloat(splitFace[j]);
        if (!isNaN(value)) {
          values.push(value);
        }
      }
    }
    return values;
  }

  this.load = function(text) {
    vertices = [];
    texCoords = [];
    normals = [];
    indices = [];

    var objFile = text.split('\n');
    for (var i = 0; i < objFile.length; i++) {
      var line = objFile[i].trim();
      // Check object type on this line
      // First two characters
      var oType = line.substr(0, 2).trim();
      // # : File comment
      if (oType === '#') {
        continue;
      }
      // v : Vertex
      if (oType === 'v') {
        var values = this.splitLineToFloats(line);
        vertices.push(values);
      }
      // vt : Texture coordinate
      if (oType === 'vt') {
        var values = this.splitLineToFloats(line);
        texCoords.push(values);
        // Get number of texture coordinates
        if (this.texCoorDim == 0) {
          this.texCoorDim = values.length;
        }
      }
      // vn : Vertex normal
      if (oType === 'vn') {
        var values = this.splitLineToFloats(line);
        normals.push(values);
      }
      // f : Face indices
      if (oType === "f") {
        var values = this.splitFace(line);
        for (var j = 0; j < values.length; j++) {
          indices.push(values[j]-1);
        }
      }
    }

    // "Unindex"
    for (var i = 0; i < indices.length / 3; i++) {
      for (var j = 0; j < vertices[indices[i*3]].length; j++) {
        this.vertices.push(vertices[indices[i*3]][j]);
      }
      for (var j = 0; j < texCoords[indices[i*3+1]].length; j++) {
        this.texCoords.push(texCoords[indices[i*3+1]][j]);
      }
      for (var j = 0; j < normals[indices[i*3+2]].length; j++) {
        this.normals.push(normals[indices[i*3+2]][j]);
      }
    }

  }

  this.loadFromFile = function(fileName, colorMap) {
    var XmlRequest = new XMLHttpRequest();
    XmlRequest.open("GET", fileName, false);
    if (XmlRequest.overrideMimeType) {
      XmlRequest.overrideMimeType("text/plain");
    }
    try{
      XmlRequest.send(null);
    } catch(e) {
      console.log('Error reading file "' + path + '"');
    }
    this.load(XmlRequest.responseText);
    this.colorMap = loadTexture(colorMap);
    return;
  }

  this.setupBuffers = function() {
    this.vertexBuffer = this.generateBuffer(gl.ARRAY_BUFFER, this.vertices, 3);
    this.normalBuffer = this.generateBuffer(gl.ARRAY_BUFFER, this.normals, 3);
    this.texCoordBuffer = this.generateBuffer(gl.ARRAY_BUFFER, this.texCoords, this.texCoorDim);
  }

  this.setupShader = function(shader) {
    this.shader = shader;
    // Get shader attributes
    this.shader.vertexPositionAttribute = gl.getAttribLocation(this.shader, "aVertexPosition");
    this.shader.normalAttribute = gl.getAttribLocation(this.shader, "aNormal");
    this.shader.texcoordAttribute = gl.getAttribLocation(this.shader, "aTextureCoord");
    // Get shader uniforms
    this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
    this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");
    // Assign texture sampler
    gl.useProgram(this.shader);
    gl.uniform1i(gl.getUniformLocation(this.shader, 'sTexture'), 0);
  }

  this.render = function() {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.colorMap);

    gl.useProgram(this.shader);

    gl.enableVertexAttribArray(this.shader.vertexPositionAttribute);
    gl.enableVertexAttribArray(this.shader.normalAttribute);
    gl.enableVertexAttribArray(this.shader.texcoordAttribute);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.shader.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.vertexAttribPointer(this.shader.texcoordAttribute, this.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(this.shader.normalAttribute, this.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);

    gl.disableVertexAttribArray(this.shader.vertexPositionAttribute);
    gl.disableVertexAttribArray(this.shader.normalAttribute);
    gl.disableVertexAttribArray(this.shader.texcoordAttribute);
  }

}
