/**
 * Converts Euler angles to Quaternions based on the rot, which it allRotations at a certain index.
 * @param rot
 * @returns {number[]}
 */
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

/**
 * Calculates the slerp, which is based on 2 point and a t value for interpolation between the 2 points.
 * It outputs the quaternion of the new rotation.
 * @param q1
 * @param q2
 * @param t
 * @returns {*}
 */
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