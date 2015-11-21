'use strict';

// THIS HOLDS ALL THE EVENT HANDLERS FOR THE APPLICATION

var topLeft = {x: 0, y: 0}, bottomRight = {x: 0, y: 0};
var menuWidth = 430;

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

// Handles clicking to create and destroy element menu bars
document.body.addEventListener('click', function(event) {
  var element = event.path[0];
  // console.log(element);
  // if an element is clicked that isn't the body or the menu and menu doesn't exist, create the menu bar
  if (element != document.body &&
      !element.classList.contains('element-menu') &&
      !document.querySelector('.element-menu')) {
    var menuContainer = createElMenuContainer(element);
    var elMenu = createElementMenu(element);
    menuContainer.appendChild(elMenu);
    addElementMenuBarListeners(element);
  // if a menu bar exists and a click is made not on it or its options, close menu bar
  } else if (document.querySelector('.element-menu') && !element.classList.contains('element-menu') && !element.classList.contains('menu-bar-item')) {
    var menuContainer = document.querySelector('.element-menu-container');
    menuContainer.parentNode.removeChild(menuContainer);
  }
});

function addTextareaListener() {
  document.querySelector('#temporaryInput').addEventListener('blur', function(event) {
    console.log('blurred', event.path[0]);
    var textarea = event.path[0];
    var input = textarea.value;
    textarea.parentNode.innerText = input;
    updateSavedElement(event.path[1], 'innerText', input);
    textarea.removeEventListener('blur', function() {
      textarea.parentNode.removeChild(textarea);
    });
  });
}

function addElementMenuBarListeners(element) {
  editTextListener(element);
  fontColorListener(element);
  backgroundColorListener(element);
  borderListener(element);
  smallerFontListener(element);
  largerFontListener(element);
  leftJustifyListener(element);
  centerJustifyListener(element);
  rightJustifyListener(element);
  fullWidthListener(element);
  fullHeightListener(element);
  closeMenuBarListener(element);
}

// ELEMENT MENU BAR CLICK LISTENERS
function editTextListener(element) {
  document.querySelector('#edit-text').addEventListener('click', function() {
    var text = element.innerText;
    element.innerText = '';
    createElementTextarea(element, text);
  });
}
function fontColorListener(element) {
  document.querySelector('#font-color').addEventListener('change', function() {
    element.style.color = document.querySelector('#font-color').value;
    updateSavedElement(element, 'style', {color: element.style.color});
  });
}
function backgroundColorListener(element) {
  document.querySelector('#background-color').addEventListener('change', function() {
    element.style.backgroundColor = document.querySelector('#background-color').value;
    updateSavedElement(element, 'style', {backgroundColor: element.style.backgroundColor});
  });
}
function borderListener(element) {
  document.querySelector('#toggle-border').addEventListener('click', function() {
    if (element.style.border === 'none') element.style.border = '1px solid black';
    else element.style.border = 'none';
    updateSavedElement(element, 'style', {border: element.style.border});
  });
}
function smallerFontListener(element) {
  document.querySelector('#smaller-font').addEventListener('click', function() {
    element.style.fontSize = + element.style.fontSize.slice(0,-2) - 4 + 'px';
    updateSavedElement(element, 'style', {fontSize: element.style.fontSize});
  });
}
function largerFontListener(element) {
  document.querySelector('#larger-font').addEventListener('click', function() {
    element.style.fontSize = + element.style.fontSize.slice(0,-2) + 4 + 'px';
    updateSavedElement(element, 'style', {fontSize: element.style.fontSize});
  });
}
function leftJustifyListener(element) {
  document.querySelector('#left-justify').addEventListener('click', function() {
    element.style.textAlign = 'left';
    updateSavedElement(element, 'style', {textAlign: element.style.textAlign});
  });
}
function centerJustifyListener(element) {
  document.querySelector('#center-justify').addEventListener('click', function() {
    element.style.textAlign = 'center';
    updateSavedElement(element, 'style', {textAlign: element.style.textAlign});
  });
}
function rightJustifyListener(element) {
  document.querySelector('#right-justify').addEventListener('click', function() {
    element.style.textAlign = 'right';
    updateSavedElement(element, 'style', {textAlign: element.style.textAlign});
  });
}
function fullWidthListener(element) {
  document.querySelector('#full-width').addEventListener('click', function() {
    element.style.width = '100%';
    element.style.left = '0';
    updateSavedElement(element, 'style', {width: element.style.width, left: element.style.left});
  });
}
function fullHeightListener(element) {
  document.querySelector('#full-height').addEventListener('click', function() {
    element.style.height = '100%';
    element.style.top = '0';
    updateSavedElement(element, 'style', {height: element.style.height, top: element.style.top});
  });
}
function closeMenuBarListener(element) {
  document.querySelector('#close-menu-bar').addEventListener('click', function() {
    element.parentNode.removeChild(element);
  });
}


// RELATED FUNCTIONS

function createElMenuContainer(element) {
  var container = document.createElement('div');
  var parentWidth = window.getComputedStyle(element).getPropertyValue('width');
  var left = handleHorizontalElementMenuPlacement(element, parentWidth);
  var top = handleVerticalElementMenuPlacement(element);
  left = -left + 'px';
  top = top + 'px';
  addStyles(container, {
    'width': parentWidth,
    'left': left,
    'top': top
  });
  container.classList.add('element-menu-container');
  element.appendChild(container);
  return container;
}

function createElementMenu(element) {
  var elMenu = document.createElement('div');
  elMenu.classList.add('element-menu');
  elMenu.innerHTML = '<i id="edit-text" style="font-size: 32px;" class="fa fa-pencil-square fa-2x menu-bar-item black-font"></i>' +
                     '<i style="font-size: 32px;" class="fa fa-font fa-2x menu-bar-item"><input id="font-color" type="color" class="menu-bar-item text-color-input menu-color-pickers"></i>' +
                     '<input id="background-color" type="color" class="menu-bar-item menu-color-pickers" value="#FFFFFF">' +
                     '<i id="toggle-border" style="font-size: 32px;" class="fa fa-square-o fa-2x menu-bar-item black-font"></i>' +
                     '<i id="smaller-font" style="font-size: 21.3333px;" class="fa fa-font fa-lg menu-bar-item black-font"></i>' +
                     '<i id="larger-font" style="font-size: 48px;" class="fa fa-font fa-3x menu-bar-item black-font"></i>' +
                     '<i id="left-justify" style="font-size: 32px;" class="fa fa-align-left fa-2x menu-bar-item black-font"></i>' +
                     '<i id="center-justify" style="font-size: 32px;" class="fa fa-align-center fa-2x menu-bar-item black-font"></i>' +
                     '<i id="right-justify" style="font-size: 32px;" class="fa fa-align-right fa-2x menu-bar-item black-font"></i>' +
                     '<i id="full-width" style="font-size: 32px;" class="fa fa-arrows-h fa-2x menu-bar-item black-font"></i>' +
                     '<i id="full-height" style="font-size: 32px;" class="fa fa-arrows-v fa-2x menu-bar-item black-font"></i>' +
                     '<i id="close-menu-bar" style="font-size: 32px;" class="fa fa-close fa-2x menu-bar-item black-font"></i>';
  return elMenu;
}

// handle the various horizontal placement needs of the element menu bar when it pops up
function handleHorizontalElementMenuPlacement(userElement, parentWidth) {
  // center menu if parent element is less wide than the menu
  var left = (parentWidth.slice(0,-2) < menuWidth) ? (menuWidth-parentWidth.slice(0,-2)) / 2 : 0;
  // console.log(userElement.style.left);
  // move menu to left edge of parent element when it would otherwise go offscreen to the left
  if (left !== 0 && left > userElement.style.left.slice(0,-2)) left = 0;
  // move right edge of menu to right edge of parent element when it would other be offscreen to the right
  else if (userElement.style.left.slice(0,-2) - left + menuWidth >= document.body.scrollWidth) left = menuWidth - parentWidth.slice(0,-2);
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

