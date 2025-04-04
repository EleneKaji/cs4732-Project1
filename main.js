let canvas, gl, program;

let fileUploaded = false;

let controlPoints, rotations;
let allRotations = [];
let points = [], allPoints = [];
let xMin, xMax, yMin, yMax;
const c = 4;

let eye, modelViewMatrix, projectionMatrix, modelViewMatrixLoc, projectionMatrixLoc;
let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);
let fovy = 70;

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


function slerp(q1, q2, t) {
    q1 = normalize(q1);
    q2 = normalize(q2);

    let dotProduct = dot(q1, q2);

    if (dotProduct < 0) {
        q2 = negate(q2);
        dotProduct = -dotProduct;
    }

    if (dotProduct >= 1) {
        return normalize(mix(q1, q2, t));
    }

    const theta = Math.acos(dotProduct);

    let coeff1 = Math.sin((1 - t) * theta) / Math.sin(theta);
    let coeff2 = Math.sin(t * theta) / Math.sin(theta);

    return normalize(q1.map((q1i, i) => coeff1 * q1i + coeff2 * q2[i]));
}

let rotIdx = 0;

function rotateCube() {
    if (rotIdx >= indices.length - 1) {
        console.log("rotation reached");
        movingCount++;
        rotIdx = 0;

        if (movingCount % 2 === 0) {
            curvePoints = generateBSpline(allPoints)
            console.log("new curve points (BSpline)", curvePoints)
        }
        else {
            curvePoints = generateCatmullRomCurve(allPoints);
            console.log("new curve points (CatmullRomCurve)", curvePoints)
        }

        rotateNow = false;
        return
    }

    let q1 = allRotations[rotIdx];
    let q2 = allRotations[rotIdx + 1];

    if (q1[0] === q2[0] && q1[1] === q2[1] && q1[2] === q2[2] && q1[3] === q2[3]) {
        rotIdx++;
        startTime = performance.now();
        return;
    }

    q1 = eulerToQuaternion(q1)
    q2 = eulerToQuaternion(q2)

    const elapsed = (performance.now() - startTime) / 1000;
    const t = Math.min(Math.max((elapsed) / 2, 0), 1);

    if (t >= 1.0) {
        rotIdx++;
        startTime = performance.now();
    }

    let currentQuat = slerp(q1, q2, t);
    let rotationMatrix = quatToMatrix(currentQuat);

    modelViewMatrix = mult(lookAt(eye, at, up), mult(translationMatrix, rotationMatrix));
}

function eulerToQuaternion(rot) {
    let roll = rot[0] * Math.PI / 180
    let pitch = rot[1] * Math.PI / 180
    let yaw = rot[2] * Math.PI / 180

    let cr = Math.cos(roll * 0.5);
    let sr = Math.sin(roll * 0.5);
    let cp = Math.cos(pitch * 0.5);
    let sp = Math.sin(pitch * 0.5);
    let cy = Math.cos(yaw * 0.5)
    let sy = Math.sin(yaw * 0.5);

    return [sr * cp * cy - cr * sp * sy,
        cr * sp * cy + sr * cp * sy,
        cr * cp * sy - sr * sp * cy,
        cr * cp * cy + sr * sp * sy]
}