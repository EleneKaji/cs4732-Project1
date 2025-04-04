/**
 * Generates catmull rom curve and returns a 2D array populated with vec4 arrays
 * @param points
 * @param segments
 * @returns {*[]}
 */
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

/**
 * Generates BSpline and returns a 2D array populated with vec4 arrays
 * @param points
 * @param segments
 * @returns {*[]}
 */
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