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

function Earth(shader, shaderAtmosphere)  {

  this.shader = shader;
  this.shaderAtmosphere = shaderAtmosphere;
  this.vboGlobe = null;
  this.vboAtmosphere = null;
  this.colorMapDay = null;
  this.colorMapNight = null;
  this.cloudMap = null;
  this.cloudPosition = 0;
  this.shaderRotation = 0;
  this.rotation = 0;

  console.debug(this);

  this.generateGlobe = function(radius, detail) {
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

    this.vboGlobe = new vertexBufferObject();
    this.vboGlobe.setVertices(vertices, this.shader.vertexPositionAttribute);
    this.vboGlobe.setNormals(normals, this.shader.normalAttribute);
    this.vboGlobe.setTextureCoordinates(texcoords, this.shader.texcoordAttribute, 2);
  }

  // Create a ring using triangles that stretches outside the globe
  // and inside to "simulate" the blue haze of earth's atmosphere
  this.generateAtmosphere = function(scale, detail) {
    var vertices = [];
    var normals = [];
    var texcoords = [];
    var colors = [];

    // Generate atmosphere
    vertices.length = 0;
    texcoords.length = 0;
    normals.length = 0;

    var pA = detail;
    var s = scale;
    var sI = 12; // Relative scale for center of the ring
    var sO = 10; // Relative outer ring scale
    var sE = 13; // Relative inner ring scale

    for (var i = 0; i < pA; ++i) {
      //Outer
      colors.push(0, 0, 0.5, 0.0);        vertices.push((Math.sin(i*360/pA*PI/180)*rad_to_deg)/sO*s, (Math.cos(i*360/pA*PI/180)*rad_to_deg)/sO*s, 0);
      colors.push(0.46, 0.74, 0.99, 0.5); vertices.push((Math.sin(i*360/pA*PI/180)*rad_to_deg)/sI*s, (Math.cos(i*360/pA*PI/180)*rad_to_deg)/sI*s, 0);
      colors.push(0, 0, 0.5, 0.0);        vertices.push((Math.sin((i+1)*360/pA*PI/180)*rad_to_deg)/sO*s, (Math.cos((i+1)*360/pA*PI/180)*rad_to_deg)/sO*s, 0);

      colors.push(0.46, 0.74, 0.99, 0.5); vertices.push((Math.sin(i*360/pA*PI/180)*rad_to_deg)/sI*s, (Math.cos(i*360/pA*PI/180)*rad_to_deg)/sI*s, 0);
      colors.push(0.0, 0, 0.5, 0.0);      vertices.push((Math.sin((i+1)*360/pA*PI/180)*rad_to_deg)/sO*s, (Math.cos((i+1)*360/pA*PI/180)*rad_to_deg)/sO*s, 0);
      colors.push(0.46, 0.74, 0.99, 0.5); vertices.push((Math.sin((i+1)*360/pA*PI/180)*rad_to_deg)/sI*s, (Math.cos((i+1)*360/pA*PI/180)*rad_to_deg)/sI*s, 0);

      // Inner
      colors.push(0, 0, 0.5, 0.0);        vertices.push((Math.sin(i*360/pA*PI/180)*rad_to_deg)/sE*s, (Math.cos(i*360/pA*PI/180)*rad_to_deg)/sE*s, 0);
      colors.push(0.46, 0.74, 0.99, 0.5); vertices.push((Math.sin(i*360/pA*PI/180)*rad_to_deg)/sI*s, (Math.cos(i*360/pA*PI/180)*rad_to_deg)/sI*s, 0);
      colors.push(0, 0, 0.5, 0.0);        vertices.push((Math.sin((i+1)*360/pA*PI/180)*rad_to_deg)/sE*s, (Math.cos((i+1)*360/pA*PI/180)*rad_to_deg)/sE*s, 0);

      colors.push(0.46, 0.74, 0.99, 0.5); vertices.push((Math.sin(i*360/pA*PI/180)*rad_to_deg)/sI*s, (Math.cos(i*360/pA*PI/180)*rad_to_deg)/sI*s, 0);
      colors.push(0.0, 0, 0.5, 0.0);      vertices.push((Math.sin((i+1)*360/pA*PI/180)*rad_to_deg)/sE*s, (Math.cos((i+1)*360/pA*PI/180)*rad_to_deg)/sE*s, 0);
      colors.push(0.46, 0.74, 0.99, 0.5); vertices.push((Math.sin((i+1)*360/pA*PI/180)*rad_to_deg)/sI*s, (Math.cos((i+1)*360/pA*PI/180)*rad_to_deg)/sI*s, 0);
    }

    this.vboAtmosphere = new vertexBufferObject();
    this.vboAtmosphere.setVertices(vertices, this.shaderAtmosphere.vertexPositionAttribute);
    this.vboAtmosphere.setColors(colors, this.shaderAtmosphere.colorAttribute);
  }

  this.generate = function() {
    this.generateGlobe(2, 64);
    this.generateAtmosphere(0.425, 64);
  }

  this.render = function() {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.colorMapDay);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.colorMapNight);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.cloudMap);
    gl.useProgram(this.shader);
    gl.uniform1i(gl.getUniformLocation(this.shader, "uColorMapDay"), 0);
    gl.uniform1i(gl.getUniformLocation(this.shader, "uColorMapNight"), 1);
    gl.uniform1i(gl.getUniformLocation(this.shader, "uCloudMap"), 2);
    gl.uniform1f(gl.getUniformLocation(this.shader, "cos_time_0_2PI"), Math.sin(this.shaderRotation));
    gl.uniform1f(gl.getUniformLocation(this.shader, "sin_time_0_2PI"), Math.cos(this.shaderRotation));
    gl.uniform1f(gl.getUniformLocation(this.shader, "uCloudPosition"), this.cloudPosition);
    gl.uniform1f(gl.getUniformLocation(this.shader, "season"), 0.5);
    gl.enableVertexAttribArray(this.shader.vertexPositionAttribute);
    gl.enableVertexAttribArray(this.shader.normalAttribute);
    gl.enableVertexAttribArray(this.shader.texcoordAttribute);
    this.vboGlobe.render(gl.TRIANGLE_STRIP);
    gl.disableVertexAttribArray(this.shader.vertexPositionAttribute);
    gl.disableVertexAttribArray(this.shader.normalAttribute);
    gl.disableVertexAttribArray(this.shader.texcoordAttribute);

    gl.depthFunc(gl.ALWAYS);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.useProgram(this.shaderAtmosphere);
    gl.enableVertexAttribArray(this.shaderAtmosphere.vertexPositionAttribute);
    gl.enableVertexAttribArray(this.shaderAtmosphere.colorAttribute);
    this.vboAtmosphere.render(gl.TRIANGLES);
    gl.disable(gl.BLEND);
    gl.depthFunc(gl.LEQUAL);
  }

  this.update = function(timeFactor) {
    this.cloudPosition -= timeFactor * 0.00001;
    this.shaderRotation -= timeFactor * 0.00025;
    if (this.shaderRotation > 360) {
      this.shaderRotation -= 360;
    }
    this.rotation += timeFactor * 0.00005;
    if (this.rotation > 360) {
      this.rotation -= 360;
    }
  }

}
