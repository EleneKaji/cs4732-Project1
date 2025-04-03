let canvas, gl, program;

let fileUploaded = false;

let controlPoints;
let points = [], allPoints = [];
let xMin, xMax, yMin, yMax;
const c = 4;

let eye, modelViewMatrix, projectionMatrix, modelViewMatrixLoc, projectionMatrixLoc;
let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);
let fovy = 100;

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

    render();
}

function handle_img_upload(event) {
    if (event.target.files[0]) {
        let file = event.target.files[0];
        let reader = new FileReader();
        reader.readAsText(file);

        reader.onload = function () {
            const fileContent = reader.result;
            const spline = new Spline();
            let minMax = spline.loadFromText(fileContent);
            xMin = minMax.xMin;
            xMax = minMax.xMax;
            yMin = minMax.yMin;
            yMax = minMax.yMax;

            spline.printSpline();

            fileUploaded = true;
            controlPoints = spline.controlPoints

            calculatePoints(controlPoints);
            catmullCurve = generateCatmullRomCurve(allPoints);
            makeCube();
        }
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    if (fileUploaded){

        modelViewMatrix = lookAt(eye, at, up);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
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
        moveCube()
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

        gl.uniform1f(gl.getUniformLocation(program, "isPoints"), false);

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

function calculateDistance(p1, p2){
    return Math.sqrt(
        Math.pow((p2[0] - p1[0]), 2) +
        Math.pow((p2[1] - p1[1]), 2) +
        Math.pow(((p2[2] || 0.0) - (p1[2] || 0.0)), 2)
    );
}

function calculateTranslationMatrix(interpolatedPos){
    return mat4(
        1.0, 0.0, 0.0, interpolatedPos[0],
        0.0, 1.0, 0.0, interpolatedPos[1],
        0.0, 0.0, 1.0, interpolatedPos[2] || 0.0,
        0.0, 0.0, 0.0, 1.0
    );
}

function calculatePoints(){
    for (let i = 0; i < controlPoints.length - 2; i +=3) {
        let posX = controlPoints[i];
        let posY = controlPoints[i + 1];
        let posZ = controlPoints[i + 2];

        let x = ((posX - (xMin - c)) / ((xMax + c) - (xMin - c))) * 2 - 1;
        let y = 1 - 2 * ((posY - (yMin - c)) / ((yMax + c) - (yMin - c)));

        points.push(x, y, posZ, 1.0);
        allPoints.push(vec4(x, y, posZ, 1.0))
    }

    console.log(allPoints)
    console.log(points);
}

let currentIdx = 0;
let t = 0;

function moveCube(){
    let p1 = catmullCurve[currentIdx]
    let p2 = catmullCurve[currentIdx + 1]

    let segmentDistance = calculateDistance(p1, p2);
    console.log(p1, p2, "segments length: ", segmentDistance);
    t += (0.001 / segmentDistance);

    if (t >= 1.0) {
        console.log("STUCK IN THE WHILE LOOP")
        t = 0;
        currentIdx++;

        if (currentIdx >= catmullCurve.length - 1)
            currentIdx = 0;
        p1 = catmullCurve[currentIdx];
        p2 = catmullCurve[currentIdx + 1];
    }

    let interpolatedPos = [
        p1[0] + (p2[0] - p1[0]) * t,
        p1[1] + (p2[1] - p1[1]) * t,
        p1[2] + (p2[2] - p1[2]) * t,
    ];

    let translationMatrix = calculateTranslationMatrix(interpolatedPos)
    modelViewMatrix = mult(translationMatrix, lookAt(eye, at, up));
}

function matMult(u, M) {
    let result = [0, 0, 0, 0];

    for (let i = 0; i < 4; i++) {
        let sum = 0;
        for (let j = 0; j < 4; j++) {
            sum += u[j] * M[j][i];
        }
        result[i] = sum;
    }

    return result;
}

let catmullCurve = [];
function generateCatmullRomCurve(points, segments = 20) {

    console.log(points)

    let curve = [];

    let M = [[-0.5, 1.5, -1.5, 0.5],
        [1, -2.5, 2, -0.5],
        [-0.5, 0, 0.5, 0],
        [0, 1, 0, 0]];

    for (let i = 0; i < points.length - 3; i++) {
        let p0 = points[i];
        let p1 = points[i + 1];
        let p2 = points[i + 2];
        let p3 = points[i + 3];

        for (let j = 0; j <= segments; j++) {
            let t = j / segments;
            let U = vec4([t * t * t, t * t, t, 1])

            let coeff = matMult(U, M);

            let x = p0[0] * coeff[0] + p1[0] * coeff[1] + p2[0] * coeff[2] + p3[0] * coeff[3];
            let y = p0[1] * coeff[0] + p1[1] * coeff[1] + p2[1] * coeff[2] + p3[1] * coeff[3];

            curve.push(vec4(x, y, 1.0, 1.0));
        }
    }

    console.log("curve", curve);

    return curve;
}