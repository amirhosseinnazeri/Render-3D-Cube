const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const width = 600, height = 600;
const MODEL_MIN_X = -2, MODEL_MAX_X = 2,
      MODEL_MIN_Y = -2, MODEL_MAX_Y = 2,
      STEP = 2;
const LINE_WIDTH = 4;
var points = [];
var triangles = [];

var colors = [
    'red', 'green', 'blue', 'white',
    'orange', 'purple', 'cyan', 'gray'
]

function makeTriangle(a, b, c, dimension, side) {
    var side1 = b.subtract(a),
        side2 = c.subtract(a);
    var orientationVector = side1.cross(side2);

    if (Math.sign(orientationVector[dimension]) == Math.sign(side)) {
       return [a, b, c];
    }

    return [a, c, b];
}

function initGeometry() {
    for (var x = -1; x <= 1; x += STEP) {
        for (var y = -1; y <= 1; y += STEP) {
            for (var z = -1; z <= 1; z += STEP) {
                points.push(new Vector(x, y, z))
            }
        }
    }
    for (var dimension = 0; dimension <= STEP; ++dimension) {
        for (var side = -1; side <= 1; side += 2) {
            var sidePoints = points.filter((point) => {
                return point[dimension] == side;
            });
            var a = sidePoints[0],
                b = sidePoints[1]
                c = sidePoints[2]
                d = sidePoints[3]
            if (dimension === 1) {
                triangles.push(makeTriangle(a, b, c, dimension, side));
                triangles.push(makeTriangle(d, b, c, dimension, side));
            } else {
                triangles.push(makeTriangle(a, b, c, dimension, -side));
                triangles.push(makeTriangle(d, b, c, dimension, -side));
            }
            
        }
    }
}

function perspectiveProjection(point) {
    var x = point[0],
        y = point[1],
        z = point[2]
    return new Vector (
        x / (z + LINE_WIDTH),
        y / (z + LINE_WIDTH),
        z
    );
}

function project(point) {
    var perspectivePoint = perspectiveProjection(point);
    var x = perspectivePoint[0],
        y = perspectivePoint[1],
        z = perspectivePoint[2];
    return new Vector (
        width * (x - MODEL_MIN_X) / (MODEL_MAX_X - MODEL_MIN_X),
        height * (1 - (y - MODEL_MIN_Y) / (MODEL_MAX_Y - MODEL_MIN_Y)),
        z
    );
}

function renderPoint(point) {
    var projectedPoint = project(point);
    var x = projectedPoint[0],
        y = projectedPoint[1];

    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + 1, y + 1);
    context.lineWidth = LINE_WIDTH;
    context.strokeStyle = 'white';
    context.stroke();
}

function renderTriangle(triangle, color) {
    var projectedTriangle = triangle.map(project);
    var a = projectedTriangle[0],
        b = projectedTriangle[1],
        c = projectedTriangle[2];
    var side1 = b.subtract(a),
        side2 = c.subtract(a);
    if (!side1.ccw(side2)) {
        context.beginPath();
    context.moveTo(a[0], a[1]);
    context.lineTo(b[0], b[1]);
    context.lineTo(c[0], c[1]);
    context.lineTo(a[0], a[1]);
    context.strokeStyle = 'white';
    context.fillStyle = color;
    context.stroke();
    context.fill();
    }
    
}




var theta = 0;
var deltaTheta = 0.02;

function render() {
    context.fillStyle='black';
    context.fillRect(0, 0, width, height);

    theta += deltaTheta;
    triangles.forEach((triangle, index) => {
        var rotatedTriangle = triangle.map((point) => {
            point = point.rotateY(point, theta);
            point = point.rotateX(point, 0.43 * theta);
            return point;
        });
        var color = colors[Math.floor(index / 2)]
        renderTriangle(rotatedTriangle, color);
    });

    requestAnimationFrame(render)
}


initGeometry();
render();