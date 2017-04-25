(function() {
  "use strict";

  var canvas = document.getElementById("circlesCanvas");
  var context = canvas.getContext("2d");

  var RIGHT_BOUND = canvas.width = window.innerWidth;
  var LOWER_BOUND = canvas.height = window.innerHeight;
  var MAX_RADIUS = 300;

  var count = 0;
  canvas.addEventListener('click', function() {
    count++;
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (count % 5 === 0) {
      color = 255;
      Circle.prototype.draw = Circle.prototype.draw1;
    } else if (count % 5 === 1) {
      context.fillStyle = "#000000"
      context.fillRect(0, 0, canvas.width, canvas.height);
      Circle.prototype.draw = Circle.prototype.draw2;
    } else if (count % 5 === 2) {
      Circle.prototype.draw = Circle.prototype.draw3;
    } else if (count % 5 === 3) {
      Circle.prototype.draw = Circle.prototype.draw4;
    } else {
      Circle.prototype.draw = Circle.prototype.draw5;
    }

    clearInterval(interval);
    circles = [];
    startSequence();
  });

  function Circle(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  Circle.prototype.distanceFromPerimeter = function(x, y) {
    return Math.sqrt((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y)) - this.radius;
  }

  // crescents
  Circle.prototype.draw5 = function() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fillStyle = getRandomColor();
    context.fill();

    var shadow = 0.99;
    context.beginPath();
    context.arc(this.x - this.radius * (1 - shadow), this.y, (this.radius) * shadow, 0, 2 * Math.PI);
    context.fillStyle = "#FFF";
    context.fill();

  }

  // mushroom trees
  Circle.prototype.draw2 = function() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fillStyle = "#000000";
    context.fill();

    var amount = 3;
    for (var shadow = .9; shadow > 0; shadow -= 0.01) {
      context.beginPath();
      var color = context.fillStyle;
      var red = (parseInt(color.substring(1, 3), 16) + amount).toString(16);
      red = red.length === 1 ? "0" + red : red;

      var green = (parseInt(color.substring(3, 5), 16) + amount).toString(16);
      green = green.length === 1 ? "0" + green : green;

      var blue = (parseInt(color.substring(5, 7), 16) + amount).toString(16)
      blue = blue.length === 1 ? "0" + blue : blue;

      context.fillStyle = "#" + red + green + blue;

      context.arc(this.x - 0.5 * this.radius * (1 - shadow), this.y, (this.radius) * shadow, 0, 2 * Math.PI);
      context.fill();
      context.closePath();
    }
  }

  // color tunnels
  Circle.prototype.draw3 = function() {
    var amount = 15;
    for (var shadow = 1; shadow > 0; shadow -= 0.05) {
      context.beginPath();
      context.fillStyle = getRandomColor();
      context.arc(this.x - 0.9 * this.radius * (1 - shadow), this.y, (this.radius) * shadow, 0, 2 * Math.PI);
      context.fill();
      context.closePath();
    }
  }


  // bubbles
  Circle.prototype.draw4 = function() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius + 5, 0, 2 * Math.PI);
    context.fillStyle = getRandomColor();
    context.fill();
  }

  // petri dish
  var color = 255;
  var colorCount = 0;
  Circle.prototype.draw1 = function() {
    var hexColor = color.toString(16);
    if (colorCount++ % 2 === 0) {
      color--;
    }
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fillStyle = "#" + hexColor + hexColor + hexColor;
    context.fill();
  }

  Circle.prototype.draw = Circle.prototype.draw1;
  startSequence();

  var circles = [];
  var interval;

  function startSequence() {
    interval = setInterval(function() {
      var giveUp = 100;
      while (giveUp-- > 0) {
        var x = getRandomInt(0, RIGHT_BOUND);
        var y = getRandomInt(0, LOWER_BOUND);

        var maybeSpot = true;
        var radius = MAX_RADIUS;
        for (var i = 0; i < circles.length; i++) {
          var circle = circles[i];
          var distanceFromPerimeter = circle.distanceFromPerimeter(x, y);
          if (distanceFromPerimeter < 0) {
            maybeSpot = false;
            break;
          }

          if (radius > distanceFromPerimeter) {
            radius = distanceFromPerimeter;
          }
        }

        if (maybeSpot) {
          var circle = new Circle(x, y, radius);
          circles.push(circle);
          circle.draw();
          break;
        }
      }

      if (giveUp === 0) {
        clearInterval(interval);
      }
    }, 1);
  }

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[getRandomInt(0, 16)];
    }
    return color;
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}());