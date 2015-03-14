/**
*
*
* @licstart  The following is the entire license notice for the
* JavaScript code in this page.
*
* Copyright (C) 2015 by Sascha Willems (www.saschawillems.de)
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

// Increase for additional fun :)
var numParticles = 1024 * 32;

// Mouse movement and tracking
var mouseDown = false;
var mouseX = 0;
var mouseY = 0;

// Frame timing
var startTime;
var lastTimeStamp;
var lastFpsTimeStamp;
var timeFactor = 1;
var framesPerSecond = 0;
var frameCount = 0;

var texture;
var pause = false;

var canvas
var gl;
var vertices = [];
var velocities = [];

function handleTextureLoaded(image, texture) {
   gl.bindTexture(gl.TEXTURE_2D, texture);
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
   gl.generateMipmap(gl.TEXTURE_2D);
   gl.bindTexture(gl.TEXTURE_2D, null);
}

function loadTexture(src) {
   var image = new Image();
   var texture = gl.createTexture();
   image.src = src;
   image.onload = function() {handleTextureLoaded(image, texture); };
   return texture;
}

function initTextures() {
  texture = loadTexture("particle.png")
}

function resetParticles() {
  for (var i=0; i < numParticles; i++) {
    // Initialize random positon on circle
    var rndRad = Math.random() * 2.0 * Math.PI;
    var rndPos = Math.random();
    // Position
    vertices[i*6] = Math.sin(rndRad) * rndPos * 0.25;
    vertices[i*6+1] = Math.cos(rndRad) * rndPos * 0.25;
    vertices[i*6+2] = 0;
    // Color
    vertices[i*6+3] = 0.5 + Math.random() * 0.5;
    vertices[i*6+4] = 0.5 + Math.random() * 0.5;
    vertices[i*6+5] = 0.5 + Math.random() * 0.5;
    // Velocity
    velocities[i*3] = Math.sin(rndRad) * rndPos * 0.05;
    velocities[i*3+1] = Math.abs(Math.cos(rndRad) * rndPos * 0.05);
    velocities[i*3+2] = 0;
  }
}

function initScene() {
  canvas = document.getElementById("canvas");
  gl = canvas.getContext("experimental-webgl");
  if(!gl) {
    alert("Could not create webgl context!");
    return;
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);

  startTime = window.webkitAnimationStartTime || window.mozAnimationStartTime || new Date().getTime();
  lastTimeStamp = startTime;
  lastFpsTimeStamp = startTime;

  //  LoadShaders
  //  Vertex shader
  var vertexShaderStr = document.getElementById("shader-vs").text;
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderStr);
  gl.compileShader(vertexShader);
  if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert("Could not compile vertex shader");
    gl.deleteShader(vertexShader);
    return;
  }
  // Fragment shader
  var fragmentShaderStr = document.getElementById("shader-fs").text;
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderStr);
  gl.compileShader(fragmentShader);
  if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert("Could not compile fragment shader");
    gl.deleteShader(fragmentShader);
    return;
  }
  // Create program and links shaders
  gl.program = gl.createProgram();
  gl.attachShader(gl.program, vertexShader);
  gl.attachShader(gl.program, fragmentShader);
  gl.linkProgram(gl.program);

  if (!gl.getProgramParameter(gl.program, gl.LINK_STATUS)) {
    alert("Error linking shaders!");
    return;
  }

  initTextures();

  gl.enable(gl.BLEND);
  gl.disable(gl.DEPTH_TEST);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  // Generate vertex buffer holding particles
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  for (var i=0; i < numParticles; i++) {
    vertices.push(/*position*/ 0, 0, 0, /*color*/ 0, 0, 0)
    velocities.push(0, 0, 0);
  }

  resetParticles();

  vertices = new Float32Array(vertices);
  velocities = new Float32Array(velocities);

  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

  var orthoMatrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, -2/(-16-16), 1,
    0, 0, 0, 1
  ];

  var modelViewMatrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];

  gl.useProgram(gl.program);

  // Vertex positions
  var vertexPosAttribLocation = gl.getAttribLocation(gl.program, "vertexPosition");
  gl.enableVertexAttribArray(vertexPosAttribLocation);
  gl.vertexAttribPointer(vertexPosAttribLocation, 3, gl.FLOAT, false, 6*4, 0);

  // Vertex colors
  var vertexColorAttribLocation = gl.getAttribLocation(gl.program, "vertexColor");
  gl.enableVertexAttribArray(vertexColorAttribLocation);
  gl.vertexAttribPointer(vertexColorAttribLocation, 3, gl.FLOAT, false, 6*4, 3*4);

  var uModelViewMatrix = gl.getUniformLocation(gl.program, "modelViewMatrix");
  var uPerspectiveMatrix = gl.getUniformLocation(gl.program, "perspectiveMatrix");

  gl.uniformMatrix4fv(uPerspectiveMatrix, false, new Float32Array(orthoMatrix));
  gl.uniformMatrix4fv(uModelViewMatrix, false, new Float32Array(modelViewMatrix));

  render();
}

function updateParticles(timeFactor) {
  var i, n = vertices.length, p, bp;

  for (i = 0; i < numParticles; i++) {
    index = i*6;

    if (vertices[index] < -1) {
      vertices[index] = -1;
      velocities[index] = -velocities[index];
    }

    if (vertices[index] > 1) {
      vertices[index] = 1;
      velocities[index] = -velocities[index];
    }

    // Gravity
    velocities[index+1] -= 0.000098;
    if (velocities[index+1] < -0.0098) {
      velocities[index+1] = -0.0098;
    }

    if (vertices[index+1] < -1) {
      vertices[index+1] = -1;
      velocities[index+1] = -velocities[index+1];
    }

    // Apply some basic damping
    velocities[index] *= 0.99;
    velocities[index+1] *= 0.99;

    // Mouse cursor attraction
    if (mouseDown) {
      var dx = mouseX - vertices[index];
      var dy = mouseY - vertices[index+1];
      d = Math.sqrt(dx * dx + dy * dy);
      if (d < 2.0) {
        if (d < 0.05) {
          velocities[index] = 0;
          velocities[index+1] = 0;
        } else {
          dx /= d;
          dy /= d;
          d = (2 - d) / 2;
          d *= d;
          velocities[index] += dx * d * 0.001;
          velocities[index+1] += dy * d * 0.001;
        }
      }
    }

    vertices[index] += velocities[index] * timeFactor;
    vertices[index+1] += velocities[index+1] * timeFactor;
  }
}

function render() {
  time = window.webkitAnimationStartTime || window.mozAnimationStartTime || new Date().getTime();

  if(time - lastFpsTimeStamp >= 1000) {
    framesPerSecond = frameCount;
    frameCount = 0;
    lastFpsTimeStamp = time;
  }

  requestAnimationFrame(render);
  drawScene();

  timeFactor = (time - lastTimeStamp) * 0.025;
  lastTimeStamp = time;
}


function drawScene() {
  if (!pause) {
    updateParticles(timeFactor);
  }

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.POINTS, 0, numParticles);
}

// Event handlers

document.onkeypress = function (e) {
  e = e || window.event;
  var charCode = e.charCode || e.keyCode,
    character = String.fromCharCode(charCode);

  if (character === "p") {
    pause = !pause;
  }

  if (character === "s") {
    for (i = 0; i < numParticles; i++) {
      velocities[i*6] = 0;
      velocities[i*6+1] = 0;
    }
  }

  if (character === "v") {
    for (i = 0; i < numParticles; i++) {
      velocities[i*6+1] = 0.05 + Math.random() * 0.05;
    }
  }

  if (character === "r") {
    resetParticles();
  }
};

function trackMousePos(x, y) {
  mouseX = (x / window.innerWidth) - 0.5;
  mouseY = -((y / window.innerHeight) - 0.5);
}

function mouseDownHandler(event) {
  mouseDown = true;
  trackMousePos(event.pageX, event.pageY);
	event.preventDefault();
	return true;
}

function mouseMoveHandler(event) {
	if (mouseDown) {
    trackMousePos(event.pageX, event.pageY);
	}
	event.preventDefault();
	return true;
}

function mouseUpHandler(event) {
  mouseDown = false;
	event.preventDefault();
	return true;
}

document.addEventListener('mousedown', mouseDownHandler, false);
document.addEventListener('mouseup', mouseUpHandler, false);
document.addEventListener('mousemove', mouseMoveHandler, false);
