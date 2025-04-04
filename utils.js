/**
 * Return a boolean if 2 arrays are equal
 * @param arr1
 * @param arr2
 * @returns {*|boolean}
 */
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((val, index) => val === arr2[index]);
}

/**
 * Calculates distance between 2 3D points
 * @param p1
 * @param p2
 * @returns {number}
 */
function calculateDistance(p1, p2){
    return Math.sqrt(
        Math.pow((p2[0] - p1[0]), 2) +
        Math.pow((p2[1] - p1[1]), 2) +
        Math.pow(((p2[2] || 0.0) - (p1[2] || 0.0)), 2)
    );
}

/**
 * Calculates simple translation matrix
 * @param interpolatedPos
 * @returns {[]}
 */
function calculateTranslationMatrix(interpolatedPos){
    return mat4(
        1.0, 0.0, 0.0, interpolatedPos[0],
        0.0, 1.0, 0.0, interpolatedPos[1],
        0.0, 0.0, 1.0, interpolatedPos[2] || 0.0,
        0.0, 0.0, 0.0, 1.0
    );
}

/**
 * Multiplies a matrix, which is the addition to mult function in lib. However, this function
 * deals with multiplication where the u and M matrices are 1xn and nxn.
 * @param u
 * @param M
 * @returns {number[]}
 */
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

/**
 * Calculates points and rotations from Spline txt file. The results are just populated
 * in allPoints and allRotations
 */
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

        allRotations.push(rotation);
    }

    console.log("control points", allPoints)
    console.log("rotations", allRotations)
}