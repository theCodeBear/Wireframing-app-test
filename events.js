'use strict';

// THIS HOLDS ALL THE EVENT HANDLERS FOR THE APPLICATION

var topLeft = {x: 0, y: 0}, bottomRight = {x: 0, y: 0};

document.body.addEventListener('dblclick', function() {
  alert('bring up menu');
});

document.body.addEventListener('mousedown', function(event) {
  topLeft.x = event.clientX;
  topLeft.y = event.clientY;
});

document.body.addEventListener('mouseup', function(event) {
  bottomRight.x = event.clientX;
  bottomRight.y = event.clientY;
  if (elementIsBigEnough({topLeft, bottomRight}))
    createNewElement({topLeft, bottomRight});
});

document.body.addEventListener('click', function(event) {
  var element = event.path[0];
});
