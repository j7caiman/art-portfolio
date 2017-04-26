(function() {
  "use strict";
  var imageCanvas = document.createElement('canvas');
  var image = new Image();
  image.src = './image.jpg';
  image.onload = function() {
    imageCanvas.width = image.width;
    imageCanvas.height = image.height;
    var imageContext = imageCanvas.getContext('2d');
    imageContext.drawImage(image, 0, 0);

    var NUM_ITERATIONS = 600;

    var canvas = document.getElementById("lines-canvas");
    var context = canvas.getContext("2d");

    var RIGHT_BOUND;
    var LOWER_BOUND;
    var interval;

    restart();

    function restart() {
      clearInterval(interval);

      RIGHT_BOUND = canvas.width = imageCanvas.width;
      LOWER_BOUND = canvas.height = imageCanvas.height;

      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, RIGHT_BOUND, LOWER_BOUND);

      context.lineWidth = 0.005;
      var firstShape = new Shape(
        [{
          x: 0,
          y: 0
        }, {
          x: 0,
          y: LOWER_BOUND
        }, {
          x: RIGHT_BOUND,
          y: LOWER_BOUND
        }, {
          x: RIGHT_BOUND,
          y: 0
        }]
      );

      var shapes = [];
      shapes.push(firstShape);

      var count = 0;
      interval = setInterval(function() {
        if (count++ === NUM_ITERATIONS) {
          clearInterval(interval);
        }
        for (var i = 0; i < 80; i++) {
          runOneIteration();
        }
      }, 40);

      function runOneIteration() {
        var line = makeLine();
        for (var i = 0; i < shapes.length; i++) {
          var shape = shapes[i];
          if (shape.containsPoint(line.randomPoint)) {
            shapes.splice(i, 1);
            var newShapes = shape.split(line);
            newShapes[0].draw();
            newShapes[1].draw();
            shapes.push(newShapes[0]);
            shapes.push(newShapes[1]);
            break;
          }
        }
      }
    }

    function makeLine() {
      var randomPoint = {
        x: ((Math.random() - 0.2) * (Math.random() - 0.2) + 0.3) * RIGHT_BOUND,
        y: ((Math.random() - 0.3) * (Math.random() - 0.3) + 0.3) * LOWER_BOUND,
      };

      var angle = Math.random() * Math.PI;

      var startPosition = {
        x: 0,
        y: randomPoint.y + Math.tan(angle) * randomPoint.x
      };

      var slope = (randomPoint.y - startPosition.y) / (randomPoint.x - startPosition.x);

      var endPosition = {
        x: RIGHT_BOUND,
        y: startPosition.y + RIGHT_BOUND * slope
      }

      return {
        start: {
          x: startPosition.x,
          y: startPosition.y
        },
        end: {
          x: endPosition.x,
          y: endPosition.y
        },
        randomPoint: {
          x: randomPoint.x,
          y: randomPoint.y
        }
      };
    }

    function getAverageColorOfShape(path) {
      var bounds = getBoundingRectangleOfShape(path);
      var imageData = imageContext.getImageData(bounds.x, bounds.y, bounds.width, bounds.height);
      var averageColor = [0, 0, 0, 255];
      var length = 0;
      for (var i = 0; i < imageData.data.length; i += 4) { // skip alpha channel
        var point = {
          x: bounds.x + (i % imageData.width),
          y: bounds.y + Math.floor(i / imageData.width)
        };
        if (isPointInsidePath(point, path)) {
          length++;
          averageColor[0] += imageData.data[i];
          averageColor[1] += imageData.data[i + 1];
          averageColor[2] += imageData.data[i + 2];
        }
      }

      averageColor[0] = Math.round(averageColor[0] / length);
      averageColor[1] = Math.round(averageColor[1] / length);
      averageColor[2] = Math.round(averageColor[2] / length);

      return averageColor;
    }

    function getBoundingRectangleOfShape(path) {
      var rectangle = {
        x: RIGHT_BOUND,
        y: LOWER_BOUND,
        x2: 0,
        y2: 0
      };

      for (var i = 0; i < path.length; i++) {
        var point = path[i];
        if (point.x < rectangle.x) {
          rectangle.x = point.x;
        }
        if (point.x > rectangle.x2) {
          rectangle.x2 = point.x;
        }
        if (point.y < rectangle.y) {
          rectangle.y = point.y;
        }
        if (point.y > rectangle.y2) {
          rectangle.y2 = point.y;
        }
      }

      return {
        x: rectangle.x,
        y: rectangle.y,
        width: rectangle.x2 - rectangle.x,
        height: rectangle.y2 - rectangle.y
      };
    }

    function getIntersectionPoint(p, p2, q, q2) {
      var r = subtractPoints(p2, p);
      var s = subtractPoints(q2, q);

      var uNumerator = crossProduct(subtractPoints(q, p), r);
      var uDenominator = crossProduct(r, s);

      if (uDenominator == 0) {
        return false;
      }

      var u = uNumerator / uDenominator;
      var t = crossProduct(subtractPoints(q, p), s) / uDenominator;

      if ((t >= 0) && (t <= 1) && (u >= 0) && (u <= 1)) {
        return {
          x: p.x + t * r.x,
          y: p.y + t * r.y
        };
      } else {
        return false;
      }

      function crossProduct(point1, point2) {
        return point1.x * point2.y - point1.y * point2.x;
      }

      function subtractPoints(point1, point2) {
        return {
          x: point1.x - point2.x,
          y: point1.y - point2.y
        };
      }
    }

    function isPointInsidePath(point, path) {
      var inside = false;
      for (var i = 0, j = path.length - 1; i < path.length; j = i++) {
        var intersect = ((path[i].y > point.y) != (path[j].y > point.y)) && (point.x < (path[j].x - path[i].x) * (point.y - path[i].y) / (path[j].y - path[i].y) + path[i].x);
        if (intersect) {
          inside = !inside;
        }
      }

      return inside;
    }

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }

    function Shape(path, fillColor) {
      this.path = path;
      var color = getAverageColorOfShape(path);
      this.fillColor = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
    }

    Shape.prototype.containsPoint = function(point) {
      return isPointInsidePath(point, this.path);
    }

    Shape.prototype.split = function(line) {
      var path = this.path;

      var newShape1 = [];
      var newShape2 = [];

      var flag = true;
      newShape1.push(path[path.length - 1]);
      for (var i = 0, j = path.length - 1; i < path.length; j = i++) {
        var intersectPoint = getIntersectionPoint(line.start, line.end, path[i], path[j]);
        if (intersectPoint === false) {
          if (flag) {
            newShape1.push(path[i]);
          } else {
            newShape2.push(path[i]);
          }
        } else {
          if (flag) {
            newShape1.push(intersectPoint);
            newShape2.push(intersectPoint);
            newShape2.push(path[i]);
          } else {
            newShape2.push(intersectPoint);
            newShape1.push(intersectPoint);
            newShape1.push(path[i]);
          }
          flag = !flag;
        }
      }

      return [
        new Shape(newShape1),
        new Shape(newShape2)
      ];
    }

    Shape.prototype.draw = function() {
      context.beginPath();
      context.moveTo(this.path[0].x, this.path[0].y);
      for (var i = 1; i < this.path.length; i++) {
        var point = this.path[i];
        context.lineTo(point.x, point.y);
      }
      context.fillStyle = this.fillColor;
      context.fill();
    }
  };
}());