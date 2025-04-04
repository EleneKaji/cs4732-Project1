/**
 * Read from spline1.txt to get the number of splines, number of control points, duration time,
 * control points and rotations per control point.
 */
class Spline {
    constructor() {
        this.nSplines = 0;
        this.nControlPoints = 0;
        this.nDuration = 0;

        this.controlPoints = [];
        this.rotations = [];
    }

    /**
     * Read from the text through fileContent, and return the min and max values for x and y from all points
     * to map the points to canvas correctly
     * @param fileContent
     * @returns {{xMin: number, xMax: number, yMin: number, yMax: number}}
     */
    loadFromText(fileContent) {
        this.resetVariables();

        const lines = fileContent.split('\n').map(line => line.trim())
        let index = 0;

        let xMin = Infinity, xMax = -Infinity;
        let yMin = Infinity, yMax = -Infinity;

        while (index < lines.length) {
            const line = lines[index]

            if (line.charAt(0) === '#' || !line) {
                index++;
                continue;
            }
            else if (this.nSplines === 0) {
                this.nSplines = parseInt(line)
                index++;
                continue;
            }
            else if (this.nControlPoints === 0) {
                this.nControlPoints = parseInt(line)
                index++;
                continue;
            }
            else if (this.nDuration === 0) {
                this.nDuration = parseFloat(line)
                index++;
                continue;
            }

            const position = lines[index].split(",").map(Number);
            let x = position[0];
            let y = position[1];
            let z = position[2];

            xMin = Math.min(xMin, x);
            xMax = Math.max(xMax, x);
            yMin = Math.min(yMin, y);
            yMax = Math.max(yMax, y);

            this.controlPoints.push(x, y, z);
            index += 2;

            const rotation = lines[index].split(",").map(Number);
            this.rotations.push(rotation[0], rotation[1], rotation[2]);
            index++;
        }

        return {xMin, xMax, yMin, yMax};
    }

    /**
     * Prints the output of the read txt file
     */
    printSpline() {
        console.log("Number of splines: ", this.nSplines);
        console.log("Number of control points: ", this.nControlPoints);
        console.log("Number of duration: ", this.nDuration);

        console.log("Spline positions")
        console.log(this.controlPoints)

        console.log("Spline rotations")
        console.log(this.rotations)
    }

    /**
     * resets all the variables
     */
    resetVariables() {
        this.nSplines = 0;
        this.nControlPoints = 0;
        this.nDuration = 0;

        this.controlPoints = [];
        this.rotations = [];
    }
}