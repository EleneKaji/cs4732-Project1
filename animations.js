/**
 * animates the cube by moving to interpolated points of the control points. Once it reaches a point
 * that has more than 1 rotation (based on spline1.txt) it sets rotateNow boolean to true and gets the
 * indices of the allRotations array that has that point.
 */
function moveCube(){
    let p1 = curvePoints[currentIdx]
    let p2 = curvePoints[currentIdx + 1]

    let segmentDistance = calculateDistance(p1, p2);
    t += (0.01 / segmentDistance);

    // reached a point
    if (t >= 1.0) {
        t = 0;

        currentIdx++;

        // find indices
        indices = allPoints
            .map((p, i) => ({ point: p, index: i }))
            .filter(p =>
                Math.abs(p.point[0] - curvePoints[currentIdx][0]) < 1e-6 &&
                Math.abs(p.point[1] - curvePoints[currentIdx][1]) < 1e-6 &&
                Math.abs(p.point[2] - curvePoints[currentIdx][2]) < 1e-6
            )
            .map(p => p.index);

        // start rotation
        if (indices.length > 1 && !arraysEqual(lastIndices, indices)) {
            console.log("translation reached");
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
    modelViewMatrix = mult(mult(lookAt(eye, at, up), translationMatrix), rotationMatrix);
}

/**
 * Rotates the cube based on the rotations of that point. Once the rotation is done it makes
 * rotateNow boolean to false so that the cube starts moving along the curve. The rotations
 * are done by increasing the t value based on the actual time. The time resets every time
 * a new rotation is encountered.
 * The function calls the eulerToQuaternion to get the quaternions of 2 points. Gets the current
 * quaternion based on the slerp, and calls quatToMatrix to get the rotation of the current cube.
 */
function rotateCube() {
    // all rotations reached
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

    // if the 2 rotations are the same just skip
    if (q1[0] === q2[0] && q1[1] === q2[1] && q1[2] === q2[2] && q1[3] === q2[3]) {
        rotIdx++;
        startTime = performance.now();
        return;
    }

    q1 = eulerToQuaternion(q1)
    q2 = eulerToQuaternion(q2)

    const elapsed = (performance.now() - startTime) / 1000;
    const t = Math.min(Math.max((elapsed) / 2, 0), 1);

    // a single rotation reached
    if (t >= 1.0) {
        rotIdx++;
        startTime = performance.now();
    }

    let currentQuat = slerp(q1, q2, t);
    rotationMatrix = quatToMatrix(currentQuat);

    modelViewMatrix = mult(lookAt(eye, at, up), mult(translationMatrix, rotationMatrix));
}