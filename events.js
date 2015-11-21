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
  console.log(element);
  // if an element not the body or the tooltip is clicked, create the tooltip
  if (element != document.body &&
      !element.classList.contains('element-menu') &&
      !document.querySelector('.element-menu')) {
    var elMenu = document.createElement('div');
    elMenu.classList.add('element-menu');
    elMenu.innerHTML = '<h4>the menu! ' + element.innerText + '</h4>';
    element.appendChild(elMenu);
    // turnOnTooltipHandler();
  // if a tooltip exists and a click is made not on it, close tooltip
  } else if (document.querySelector('.element-menu') && !element.classList.contains('element-menu')) {
    var elMenu = document.querySelector('.element-menu');
    elMenu.parentNode.removeChild(elMenu);
  }
});



// function turnOnTooltipHandler() {
//   tooltip.addEventListener('click', function(event) {
//     console.log(event.path[0]);
//     console.log(event);
//     if (!event.path[0].classList.contains('tooltip')) {
//       console.log('not the tooltip');
//     }
//   });
// }
