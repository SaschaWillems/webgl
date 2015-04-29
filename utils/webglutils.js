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

const deg_to_rad = Math.PI / 180.0;
const rad_to_deg = 1/(Math.PI / 180.0);

function getWebGLContext(canvas, target, antialiasing) {
  var gl = null;
  try {
    gl = canvas.getContext(target, { antialias: antialiasing });
    if (!gl) {
      gl = canvas.getContext("experiemental-" + target, { antialias: antialiasing });
    }
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch (e) {
  }
  if (!gl) {
    alert("Could not create a " + target + " context!");
  }
  return gl;
}

function handleTextureLoaded(image, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  // Check if anisotropic filtering is supported and enable it
  var ext = gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
  if (ext != null) {
    gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 8);
  };
}

function loadTexture(src) {
  var image = new Image();
  var texture = gl.createTexture();
  image.src = src;
  image.onload = function() {handleTextureLoaded(image, texture); };
  return texture;
}

this.getShaderStrFromFile = function(path, shaderType) {
  var XmlRequest = new XMLHttpRequest();
  XmlRequest.open("GET", path, false);
  if (XmlRequest.overrideMimeType) {
    XmlRequest.overrideMimeType("text/plain");
  }
  try{
    XmlRequest.send(null);
  } catch(e) {
    console.log('Error reading file "' + path + '"');
  }
  var shader = gl.createShader(shaderType);
  gl.shaderSource(shader, XmlRequest.responseText);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
  }
  return shader;
};

/*

 */
loadShader = function(vertexShaderFile, fragmentShaderFile) {
  var vertexShader = this.getShaderStrFromFile(vertexShaderFile, gl.VERTEX_SHADER);
  var fragmentShader = this.getShaderStrFromFile(fragmentShaderFile, gl.FRAGMENT_SHADER);
  var shader = gl.createProgram();
  gl.attachShader(shader, vertexShader);
  gl.attachShader(shader, fragmentShader);
  gl.linkProgram(shader);
  if (!gl.getProgramParameter(shader, gl.LINK_STATUS)) {
    alert("Error linking shaders!");
    return null;
  }
  return shader;
};
