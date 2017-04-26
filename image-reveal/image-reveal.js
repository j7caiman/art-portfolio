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
    canvas.width = image.width;
    canvas.height = image.height;
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


    function fillShape(path, color) {
      console.log(color);
      context.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
      context.beginPath();
      context.moveTo(path[0].x, path[0].y);
      for (var i = 1; i < path.length; i++) {
        context.lineTo(path[i].x, path[i].y);
      }
      context.fill();
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
        x: canvas.width,
        y: canvas.height,
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