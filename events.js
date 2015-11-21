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
  // if an element is clicked that isn't the body or the menu and menu doesn't exit , create the menu bar
  if (element != document.body &&
      !element.classList.contains('element-menu') &&
      !document.querySelector('.element-menu')) {
    var menuContainer = createElMenuContainer(element);
    var elMenu = document.createElement('div');
    elMenu.classList.add('element-menu');
    elMenu.innerHTML = '<h4>the menu! ' + element.innerText + '</h4>';
    menuContainer.appendChild(elMenu);
  // if a menu bar  exists and a click is made not on it, close menu bar
  } else if (document.querySelector('.element-menu') && !element.classList.contains('element-menu')) {
    var menuContainer = document.querySelector('.element-menu-container');
    menuContainer.parentNode.removeChild(menuContainer);
  }
});



// RELATED FUNCTIONS

function createElMenuContainer(element) {
  var container = document.createElement('div');
  var parentWidth = window.getComputedStyle(element).getPropertyValue('width');
  var left = handleHorizontalElementMenuPlacement(element, parentWidth);
  var top = handleVerticalElementMenuPlacement(element);
  left = -left + 'px';
  top = top + 'px';
  addStyles(container, [
    ['width', parentWidth],
    ['left', left],
    ['top', top]
  ]);
  container.classList.add('element-menu-container');
  element.appendChild(container);
  return container;
}

// handle the various horizontal placement needs of the element menu bar when it pops up
function handleHorizontalElementMenuPlacement(userElement, parentWidth) {
  // center menu if parent element is less wide than the menu
  var left = (parentWidth.slice(0,-2) < 200) ? (200-parentWidth.slice(0,-2)) / 2 : 0;
  // console.log(userElement.style.left);
  // move menu to left edge of parent element when it would otherwise go offscreen to the left
  if (left !== 0 && left > userElement.style.left.slice(0,-2)) left = 0;
  // move right edge of menu to right edge of parent element when it would other be offscreen to the right
  else if (userElement.style.left.slice(0,-2) - left + 200 >= document.body.scrollWidth) left = 200 - parentWidth.slice(0,-2);
  return left;
}

//handle the various vertical placement needs of the element menu bar when it pops up
function handleVerticalElementMenuPlacement(userElement) {
  var top = -60;
  // if menu would be offscreen above and below the screen, move menu to middle of parent element
  if (userElement.style.top.slice(0,-2) <= -top && userElement.style.bottom.slice(0,-2) <= -top)
    top = window.getComputedStyle(userElement).getPropertyValue('height').slice(0,-2) / 2;
  // if menu would be off the top of the screen, move to underneath parent element
  else if (userElement.style.top.slice(0,-2) <= -top)
    top = + window.getComputedStyle(userElement).getPropertyValue('height').slice(0,-2) + 20;
  return top;
}


