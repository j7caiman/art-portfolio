(function() {
  "use strict";
  var imageCanvas = document.createElement('canvas');
  var image = new Image();
  image.src = './image2.jpg';
  image.onload = function() {
    imageCanvas.width = image.width;
    imageCanvas.height = image.height;
    var imageContext = imageCanvas.getContext('2d');
    imageContext.drawImage(image, 0, 0);

    var canvas = document.getElementById("lines-canvas");
    var $canvas = $("#lines-canvas");
    var context = canvas.getContext("2d");

    var RIGHT_BOUND = canvas.width = imageCanvas.width;
    var LOWER_BOUND = canvas.height = imageCanvas.height;
    var shapes;

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

      rectangle.width = rectangle.x2 - rectangle.x;
      rectangle.height = rectangle.y2 - rectangle.y;
      return rectangle;
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

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }

    function Shape(path) {
      this.path = path;
      this.boundingRectangle = getBoundingRectangleOfShape(path);
    }

    Shape.prototype.getAverageColorOfShape = function() {
      var bounds = this.boundingRectangle;
      var imageData = imageContext.getImageData(bounds.x, bounds.y, bounds.width, bounds.height);
      var averageColor = [0, 0, 0, 255];
      var length = 0;
      for (var i = 0; i < imageData.data.length; i += 4) { // skip alpha channel
        var point = {
          x: bounds.x + (i % imageData.width),
          y: bounds.y + Math.floor(i / imageData.width)
        };
        if (this.containsPoint(point)) {
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

    Shape.prototype.containsPoint = function(point) {
      var path = this.path;
      var bounds = this.boundingRectangle;

      if (point.x < bounds.x || point.y < bounds.y || point.x > bounds.x2 || point.y > bounds.y2) {
        return false;
      }

      var inside = false;
      for (var i = 0, j = path.length - 1; i < path.length; j = i++) {
        var intersect = ((path[i].y > point.y) != (path[j].y > point.y)) && (point.x < (path[j].x - path[i].x) * (point.y - path[i].y) / (path[j].y - path[i].y) + path[i].x);
        if (intersect) {
          inside = !inside;
        }
      }

      return inside;
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
      var approximateArea = this.boundingRectangle.width * this.boundingRectangle.height;
      if (approximateArea > 60) {
        context.beginPath();
        context.moveTo(this.path[0].x, this.path[0].y);
        for (var i = 1; i < this.path.length; i++) {
          var point = this.path[i];
          context.lineTo(point.x, point.y);
        }
        var color = this.getAverageColorOfShape();
        context.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
        context.fill();
        context.stroke();
      } else {
        var path = this.path;

        context.save();
        context.beginPath();
        context.moveTo(path[0].x, path[0].y);
        for (var i = 1; i < path.length; i++) {
          var point = path[i];
          context.lineTo(point.x, point.y);
        }
        context.clip();
        context.drawImage(image, 0, 0);
        context.restore();
      }
    }

    function createRandomLineAtPoint(point) {
      var angle = Math.random() * Math.PI;

      var start = {
        x: 0,
        y: point.y + Math.tan(angle) * point.x
      };

      var slope = (point.y - start.y) / (point.x - start.x);

      var end = {
        x: RIGHT_BOUND,
        y: start.y + RIGHT_BOUND * slope
      }

      return {
        start: {
          x: start.x,
          y: start.y
        },
        end: {
          x: end.x,
          y: end.y
        },
        randomPoint: {
          x: point.x,
          y: point.y
        }
      };
    }

    function createLine(p1, p2) {
      var slope = (p2.y - p1.y) / (p2.x - p1.x);
      return {
        start: {
          x: 0,
          y: p1.y - p1.x * slope
        },
        end: {
          x: RIGHT_BOUND,
          y: p1.y + (RIGHT_BOUND - p1.x) * slope
        },
        randomPoint: {
          x: p1.x,
          y: p1.y
        }
      };
    }

    reset();

    function createPointsNearPoint(point) {
      var numPoints = 3;

      var points = [];
      for (var i = 0; i < numPoints; i++) {
        var distance;
        switch (getRandomInt(0, 2)) {
          case 0:
            distance = Math.random() * 250;
            break;
          case 1:
            distance = (Math.random() + Math.random()) * 50;
            break;
        }

        var angle = Math.random() * 2 * Math.PI;
        points.push({
          x: point.x + Math.cos(angle) * distance,
          y: point.y + Math.sin(angle) * distance
        });

        // context.fillStyle = "#00FF00"
        // context.fillRect(points[points.length - 1].x - 1, points[points.length - 1].y - 1, 2, 2);
      }

      return points;
    }

    var on = false;

    function onMouseDown(point) {
      console.log('meow');
      console.log(point);
      on = true;
      createShatterPoints(point);
    }

    function onMouseMove(point) {
      if (!on) {
        return;
      }
      createShatterPoints(point);
    }

    function onMouseUp(event) {
      on = false;
    }

    function createShatterPoints(point) {
      var points = createPointsNearPoint(point);

      for (var i = 0; i < points.length; i++) {
        var line = createRandomLineAtPoint(points[i]);
        handleShapeSplit(line);
      }
    }

    function handleShapeSplit(line) {
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

    canvas.addEventListener('mousedown', function(event) {
      event.preventDefault();
      var offset = $canvas.offset();
      onMouseDown({
        x: event.pageX - offset.left,
        y: event.pageY - offset.top
      })
    });

    canvas.addEventListener('touchstart', function(event) {
      event.preventDefault();
      var offset = $canvas.offset();
      onMouseDown({
        x: event.touches[0].pageX - offset.left,
        y: event.touches[0].pageY - offset.top
      });
    });

    canvas.addEventListener('mousemove', function(event) {
      var offset = $canvas.offset();
      onMouseMove({
        x: event.pageX - offset.left,
        y: event.pageY - offset.top
      })
    });

    canvas.addEventListener('touchmove', function(event) {
      event.preventDefault();
      var offset = $canvas.offset();
      onMouseMove({
        x: event.touches[0].pageX - offset.left,
        y: event.touches[0].pageY - offset.top
      });
    });

    canvas.addEventListener('mouseup', onMouseUp);

    canvas.addEventListener('touchend', onMouseUp);

    function reset() {
      shapes = [];
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

      firstShape.draw();

      shapes.push(firstShape);
    }
  };
}());