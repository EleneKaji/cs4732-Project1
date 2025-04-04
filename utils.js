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

        let rotation = vec3(rotations[i], rotations[i + 1], rotations[i + 2]);

        // if (!(rotation[0] === 0 && rotation[1] === 0 && rotation[2] === 0) || i + 3 >= controlPoints.length - 2) {
            allRotations.push(rotation);
        // }
    }

    console.log("control points", allPoints)
    console.log("rotations", allRotations)
}

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((val, index) => val === arr2[index]);
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

function generateCatmullRomCurve(points, segments = 20) {
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
            let z = p0[2] * coeff[0] + p1[2] * coeff[1] + p2[2] * coeff[2] + p3[2] * coeff[3];


            curve.push(vec4(x, y, z, 1.0));
        }
    }

    console.log("curve", curve);

    return curve;
}

function generateBSpline(points, segments = 20) {
    let curve = [];

    let M = [[-1, 3, -3, 1],
        [3, -6, 3, 0],
        [-3, 0, 3, 0],
        [1, 4, 1, 0]];

    for (let i = 0; i < points.length - 3; i++) {
        let p0 = points[i];
        let p1 = points[i + 1];
        let p2 = points[i + 2];
        let p3 = points[i + 3];

        for (let j = 0; j <= segments; j++) {
            let t = j / segments;
            let U = vec4([(1/6) * t * t * t, (1/6) * t * t, (1/6) * t, 1/6])

            let coeff = matMult(U, M);

            let x = p0[0] * coeff[0] + p1[0] * coeff[1] + p2[0] * coeff[2] + p3[0] * coeff[3];
            let y = p0[1] * coeff[0] + p1[1] * coeff[1] + p2[1] * coeff[2] + p3[1] * coeff[3];
            let z = p0[2] * coeff[0] + p1[2] * coeff[1] + p2[2] * coeff[2] + p3[2] * coeff[3];

            curve.push(vec4(x, y, z, 1.0));
        }
    }

    return curve;
}


function moveCube(){
    let p1 = curvePoints[currentIdx]
    let p2 = curvePoints[currentIdx + 1]

    let segmentDistance = calculateDistance(p1, p2);
    t += (0.01 / segmentDistance);

    if (t >= 1.0) {
        t = 0;

        currentIdx++;

        indices = allPoints
            .map((p, i) => ({ point: p, index: i }))
            .filter(p =>
                Math.abs(p.point[0] - curvePoints[currentIdx][0]) < 1e-6 &&
                Math.abs(p.point[1] - curvePoints[currentIdx][1]) < 1e-6 &&
                Math.abs(p.point[2] - curvePoints[currentIdx][2]) < 1e-6
            )
            .map(p => p.index);

        if (indices.length > 1 && !arraysEqual(lastIndices, indices)) {
            console.log("indices", indices);
            rotateNow = true
            lastIndices = indices
            startTime = performance.now();
            currentIdx = 0;
            lastIndices = [];
            return
        }

        if (currentIdx >= curvePoints.length - 1)
            currentIdx = 0;

        t = 0;
        p1 = curvePoints[currentIdx];
        p2 = curvePoints[currentIdx + 1];
    }

    let interpolatedPos = [
        p1[0] + (p2[0] - p1[0]) * t,
        p1[1] + (p2[1] - p1[1]) * t,
        p1[2] + (p2[2] - p1[2]) * t,
    ];

    translationMatrix = calculateTranslationMatrix(interpolatedPos);
    modelViewMatrix = mult(lookAt(eye, at, up), translationMatrix);

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
            rotations = spline.rotations

            calculatePoints(controlPoints);
            curvePoints = generateCatmullRomCurve(allPoints);
            makeCube();
        }
    }
}