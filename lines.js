(function() {
  "use strict";

  var NUM_ITERATIONS = 300;

  var canvas = $("#linesCanvas");
  var context = canvas[0].getContext("2d");

  var RIGHT_BOUND;
  var LOWER_BOUND;
  var interval;

  canvas.click(restart);
  restart();
  function restart() {
    clearInterval(interval);

    RIGHT_BOUND = canvas[0].width = $(window).width();
    LOWER_BOUND = canvas[0].height = $(window).height();

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
      }],
      chooseFillColor()
    );

    var shapes = [];
    shapes.push(firstShape);

    var count = 0;
    interval = setInterval(function() {
      if (count++ === NUM_ITERATIONS) {
        clearInterval(interval);
      }
      for (var i = 0; i < 40; i++) {
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
      x: Math.random() * RIGHT_BOUND,
      y: ((Math.random() - 0.5) * (Math.random() - 0.5) + 0.5) * LOWER_BOUND,
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

  function chooseFillColor() {
    var chooseColor = getRandomInt(0, 3);
    var color;
    switch (chooseColor) {
      case 0:
        color = 'rgba(251,142,144,0.12)'; // pink
        break;
      case 1:
        color = 'rgba(255,255,255,0.6)'; // white
        break;
      default:
        color = 'rgba(2,39,149,0.09)'; // dark blue
        break;
    }
    return color;
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

  function Shape(path, fillColor) {
    this.path = path;
    this.fillColor = fillColor;
  }

  Shape.prototype.containsPoint = function(vertex) {
    var path = this.path;

    var inside = false;
    for (var i = 0, j = path.length - 1; i < path.length; j = i++) {
      var intersect = ((path[i].y > vertex.y) != (path[j].y > vertex.y)) && (vertex.x < (path[j].x - path[i].x) * (vertex.y - path[i].y) / (path[j].y - path[i].y) + path[i].x);
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
      new Shape(newShape1, chooseFillColor()),
      new Shape(newShape2, chooseFillColor())
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

}());