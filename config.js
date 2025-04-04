let canvas, gl, program;

// booleans
let fileUploaded = false;
let rotateNow = false;

// variables from spline txt
let controlPoints, rotations;
let allRotations = [];
let points = [], allPoints = [];
let xMin, xMax, yMin, yMax;
const c = 4;

// perspective projection and other matrices
let eye, modelViewMatrix, projectionMatrix, modelViewMatrixLoc, projectionMatrixLoc;
let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);
let fovy = 70;

// moving cube variables
let currentIdx = 0;
let t = 0;

// variables for getting indices for rotation from point the cube is currently on
let lastIndices = [];
let indices;

// rotate cube variables
let startTime;
let rotIdx = 0;

// variables for switching between splines
let movingCount = 1;
let curvePoints = [];

// translation and rotation matrices
let translationMatrix;
let rotationMatrix = mat4()