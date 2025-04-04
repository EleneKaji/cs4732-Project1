/**
 * Simple making and drawing the cube. Code we have seen a loot now.
 */

let cubePoints, cubeColors, initialCubePoints;
const vertices = [
    vec4( -0.1, -0.1,  0.1, 1.0 ),
    vec4( -0.1,  0.1,  0.1, 1.0 ),
    vec4(  0.1,  0.1,  0.1, 1.0 ),
    vec4(  0.1, -0.1,  0.1, 1.0 ),
    vec4( -0.1, -0.1, -0.1, 1.0 ),
    vec4( -0.1,  0.1, -0.1, 1.0 ),
    vec4(  0.1,  0.1, -0.1, 1.0 ),
    vec4(  0.1, -0.1, -0.1, 1.0 )
];

const vertexColors = [
    [ 0.0, 0.0, 1.0, 1.0 ],
    [ 0.0, 1.0, 0.0, 1.0 ],
    [ 0.0, 1.0, 1.0, 1.0 ],
    [ 1.0, 0.0, 0.0, 1.0 ],
    [ 1.0, 0.0, 1.0, 1.0 ],
    [ 1.0, 1.0, 0.0, 1.0 ],
    [ 0.5, 0.5, 0.5, 1.0 ],
];

function makeCube() {
    cubePoints = [];
    cubeColors = [];
    initialCubePoints = [];

    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d)
{
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        cubePoints.push(vertices[indices[i]]);
        initialCubePoints.push(vertices[indices[i]]);

        cubeColors.push(vertexColors[a]);
    }
}