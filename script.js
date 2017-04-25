var canvas = document.getElementById('viewport');
var context = canvas.getContext('2d');

var image = new Image();
image.src = 'image.jpg';
image.onload = function() {
  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0);
}