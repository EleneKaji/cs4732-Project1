/**
 * Handles image upload, by calling uploading a txt file.
 * @param event
 */
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