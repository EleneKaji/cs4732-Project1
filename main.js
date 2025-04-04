/**
 * The main function to start, sets up canvas program, gl, as well as other matrices used.
 * The cube restarts it original position after the catmul, rotation, and Bspline to show a whole loop
 * of everything working.
 */
function main() {
    canvas = document.getElementById("webgl");

    gl = WebGLUtils.setupWebGL(canvas, null)
    if (!gl) {
        console.log("Failed to get rendering context for WebGL")
        return;
    }

    program = initShaders(gl, "vshader", "fshader");

    gl.useProgram(program);
    gl.viewport( 0, 0, canvas.width, canvas.height );

    document.getElementById("files").addEventListener("change", (event) => handle_img_upload(event));

    eye = vec3(0, 0, 1.5);
    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, canvas.width / canvas.height, 0.1, 100.0);
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    render();
}

/**
 * Renders the animation. Depending on the rotateNow boolean, it either rotates or translates the cube.
 * Uses isPoints boolean that gets send to shaders to draw the cube and points separately.
 */
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    if (fileUploaded){

        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(lookAt(eye, at, up)));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        // points
        gl.uniform1f(gl.getUniformLocation(program, "isPoints"), true);

        let vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

        let vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        gl.drawArrays(gl.POINTS, 0, points.length/4);


        // cube
        gl.uniform1f(gl.getUniformLocation(program, "isPoints"), false);

        if (rotateNow){
            rotateCube()
        }
        else {
            moveCube()
        }

        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

        vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(cubePoints), gl.STATIC_DRAW);

        vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        let cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeColors), gl.STATIC_DRAW);

        let vColor = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        gl.drawArrays(gl.TRIANGLES, 0, cubePoints.length);
    }

    requestAnimationFrame(render);
}






