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

    var canvas = document.getElementById('image-reveal-canvas');
    var RIGHT_BOUND = canvas.width = image.width;
    var LOWER_BOUND = canvas.height = image.height;
    var context = canvas.getContext('2d');

    var counter = 0;
    var path = [];

    canvas.addEventListener('mousedown', function(event) {
      path = [];
    });

    canvas.addEventListener('mousemove', function(event) {
      path.push({
        x: event.x,
        y: event.y
      });
    });

    canvas.addEventListener('mouseup', function(event) {
      var averageColor = getAverageColorOfShape(path);
      fillShape(path, averageColor);
    });

    var firstShape = [{
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
    }];

    var shapes = [];
    shapes.push(firstShape);

    function splitShape(path, line) {
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
        newShape1,
        newShape2
      ];
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

    function fillShape(path, color) {
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

      // console.log(color);
      // context.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
      // context.beginPath();
      // context.moveTo(path[0].x, path[0].y);
      // for (var i = 1; i < path.length; i++) {
      //   context.lineTo(path[i].x, path[i].y);
      // }
      // context.fill();
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
}());