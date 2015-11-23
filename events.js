'use strict';

// THIS HOLDS ALL THE EVENT HANDLERS FOR THE APPLICATION

var topLeft = {x: 0, y: 0}, bottomRight = {x: 0, y: 0};
var menuWidth = 470;
var resizing = false;
var hadBorder = false;

(function($) {
  $('.absolute').draggable({start: jQueryDraggableStart, stop: jQueryDraggableStop});
})(jQuery);

function jQueryDraggableStart(event) {
  event.target.style.zIndex = ++latestZindex;
  window.localStorage.setItem('wirezZindex', latestZindex);
}
function jQueryDraggableStop(event) {
  event.target.style.bottom = computeBottomOrTopStyle(event.target.style.top, event.target.style.height, 'none', document.body.scrollHeight);
  event.target.style.right = computeBottomOrTopStyle(event.target.style.left, event.target.style.width, event.target.style.border, document.body.scrollWidth);
  updateSavedElement(event.target, 'style', {
    top: event.target.style.top,
    bottom: event.target.style.bottom,
    left: event.target.style.left,
    right: event.target.style.right,
    height: event.target.style.height,
    width: event.target.style.width,
    zIndex: event.target.style.zIndex
  });
}

// document.body.addEventListener('dblclick', function() {
//   alert('bring up menu');
// });

document.body.addEventListener('mousedown', function(event) {
  topLeft.x = event.clientX;
  topLeft.y = event.clientY;
});

document.body.addEventListener('mouseup', mouseUp);

function mouseUp(event) {
  if (!resizing && !event.path[0].classList.contains('ui-draggable-dragging')) {
    bottomRight.x = event.clientX;
    bottomRight.y = event.clientY;
    if (elementIsBigEnough({topLeft, bottomRight}))
      createNewElement({topLeft, bottomRight});
  }
}



// Handles clicking to create and destroy element menu bars
document.body.addEventListener('click', function(event) {
  var element = event.path[0];
  // console.log(element);
  // if the resize button on the menu bar has been clicked and the user clicks off that element, turn resize off
  if (resizing && !element.classList.contains('resize') && element.getAttribute('id') !== 'resize') {
    resizing = false;
    $('.absolute').draggable('enable');
    var resizedElement = document.querySelector('.resize');
    resizedElement.style.border = (hadBorder) ? '1px solid black' : 'none';
    resizedElement.classList.remove('resize');
    resizedElement.style.bottom = computeBottomOrTopStyle(resizedElement.style.top, resizedElement.style.height, resizedElement.style.border, document.body.scrollHeight);
    resizedElement.style.right = computeBottomOrTopStyle(resizedElement.style.left, resizedElement.style.width, resizedElement.style.border, document.body.scrollWidth);
    updateSavedElement(resizedElement, 'style', {
      bottom: resizedElement.style.bottom,
      right: resizedElement.style.right
    });
  }
  // if an element is clicked that isn't the body or the menu and menu doesn't exist, create the menu bar
  if (element != document.body &&
      !element.classList.contains('element-menu') &&
      !document.querySelector('.element-menu')) {
    element.style.zIndex = ++latestZindex;
    window.localStorage.setItem('wirezZindex', latestZindex);
    updateSavedElement(element, 'style', {zIndex: element.style.zIndex});
    var menuContainer = createElMenuContainer(element);
    var elMenu = createElementMenu(element);
    menuContainer.appendChild(elMenu);
    addElementMenuBarListeners(element);
  // if a menu bar exists and a click is made not on it or its options, close menu bar
  } else if (document.querySelector('.element-menu') && !element.classList.contains('element-menu') && !element.classList.contains('menu-bar-item')) {
    closeElementMenuBar();
  }
});

function addTextareaListener() {
  document.querySelector('#temporaryInput').addEventListener('blur', function(event) {
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
  fontWeightListener(element);
  paddingTopListener(element);
  paddingBottomListener(element);
  paddingLeftListener(element);
  paddingRightListener(element);
  leftJustifyListener(element);
  centerJustifyListener(element);
  rightJustifyListener(element);
  fullWidthListener(element);
  fullHeightListener(element);
  resizeListener(element);
  deleteElementListener(element);
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
function fontWeightListener(element) {
  document.querySelector('#font-weight').addEventListener('click', function() {
    if (!element.style.fontWeight) element.style.fontWeight = 500;
    else if (element.style.fontWeight === '900') element.style.fontWeight = 100;
    else element.style.fontWeight = +element.style.fontWeight + 100;
    updateSavedElement(element, 'style', {fontWeight: element.style.fontWeight});
  });
}
function paddingTopListener(element) {
  document.querySelector('#padding-top').addEventListener('click', paddingListenerCallback.bind(this, element, 'paddingTop', 'height'));
}
function paddingBottomListener(element) {
  document.querySelector('#padding-bottom').addEventListener('click', paddingListenerCallback.bind(this, element, 'paddingBottom', 'height'));
}
function paddingLeftListener(element) {
  document.querySelector('#padding-left').addEventListener('click', paddingListenerCallback.bind(this, element, 'paddingLeft', 'width'));
}
function paddingRightListener(element) {
  document.querySelector('#padding-right').addEventListener('click', paddingListenerCallback.bind(this, element, 'paddingRight', 'width'));
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
    element.style.width = document.body.scrollWidth + 'px';
    element.style.left = '0';
    updateSavedElement(element, 'style', {width: element.style.width, left: element.style.left});
  });
}
function fullHeightListener(element) {
  document.querySelector('#full-height').addEventListener('click', function() {
    element.style.height = document.body.scrollHeight + 'px';
    element.style.top = '0';
    updateSavedElement(element, 'style', {height: element.style.height, top: element.style.top});
  });
}
function resizeListener(element) {
  document.querySelector('#resize').addEventListener('click', function() {
    $('.absolute').draggable('disable');
    element.classList.add('resize');
    // need to create temporary border for resizing in case border is off
    hadBorder = (element.style.border === 'none') ? false : true;
    if (!hadBorder) element.style.border = '1px dashed black';
    resizing = true;
    // fix a bug that sometimes a piece of the menu bar still shows after resizing
    document.querySelector('.element-menu').style.visibility = 'hidden';
  });
}
function deleteElementListener(element) {
  document.querySelector('#delete-element').addEventListener('click', function() {
    deleteElement(element.getAttribute('id'));
    element.parentNode.removeChild(element);
  });
}


// RELATED FUNCTIONS

// Handler function for all four padding events from the element menu bar.
// Parameters are the element, padding type ('paddingTop/paddingBottom/paddingLeft/paddingRight'),
// and dimension ('height/width')
function paddingListenerCallback(element, paddingType, dimension) {
  if (element.style[paddingType] === '0px') element.style[paddingType] = (+element.style[dimension].slice(0,-2) / 10) + 'px';
  else if (+element.style[paddingType].slice(0,-2) >= +element.style[dimension].slice(0,-2) - (element.style.fontSize.slice(0,-2)*1.9)) element.style[paddingType] = '0px';
  else element.style[paddingType] = +element.style[paddingType].slice(0,-2) + (element.style[dimension].slice(0,-2)/10) + 'px';
  updateSavedElement(element, 'style', {[paddingType]: element.style[paddingType]});
}

// Returns a bottom or right CSS style, given top/left style, element height/width,
// and document.body.scrollHeight/Width. Returns number of pixels with the 'px' suffix.
function computeBottomOrTopStyle(topOrLeft, heightOrWidth, border, scrollHeightOrWidth) {
  // need to subtract by 2 pixel if there is a 1 pixel border for element to fix bug in saving process
  var borderAdjuster = (border === 'none') ? 0 : 2;
  topOrLeft = + topOrLeft.slice(0,-2);
  heightOrWidth = + heightOrWidth.slice(0,-2);
  return scrollHeightOrWidth - topOrLeft - heightOrWidth - borderAdjuster + 'px';
}

function closeElementMenuBar() {
  var menuContainer = document.querySelector('.element-menu-container');
  menuContainer.parentNode.removeChild(menuContainer);
}

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
  elMenu.style.cursor = 'initial';
  elMenu.classList.add('element-menu');
  elMenu.innerHTML = '<i id="edit-text" style="font-size: 32px;" class="fa fa-pencil-square fa-2x menu-bar-item black-font"></i>' +
                     '<i style="font-size: 32px;" class="fa fa-font fa-2x menu-bar-item"><input id="font-color" type="color" class="menu-bar-item text-color-input menu-color-pickers"></i>' +
                     '<input id="background-color" type="color" class="menu-bar-item menu-color-pickers" value="#FFFFFF">' +
                     '<i id="toggle-border" style="font-size: 32px;" class="fa fa-square-o fa-2x menu-bar-item black-font"></i>' +
                     '<i id="smaller-font" style="font-size: 21.3333px;" class="fa fa-font fa-lg menu-bar-item black-font"></i>' +
                     '<i id="larger-font" style="font-size: 48px;" class="fa fa-font fa-3x menu-bar-item black-font"></i>' +
                     '<i id="font-weight" style="font-size: 32px;" class="fa fa-text-width fa-2x menu-bar-item black-font"></i>' +
                     '<i id="padding-top" style="font-size: 32px;" class="fa fa-toggle-down fa-2x menu-bar-item black-font"></i>' +
                     '<i id="padding-bottom" style="font-size: 32px;" class="fa fa-toggle-up fa-2x menu-bar-item black-font"></i>' +
                     '<i id="padding-left" style="font-size: 32px;" class="fa fa-toggle-right fa-2x menu-bar-item black-font"></i>' +
                     '<i id="padding-right" style="font-size: 32px;" class="fa fa-toggle-left fa-2x menu-bar-item black-font"></i>' +
                     '<i id="left-justify" style="font-size: 32px;" class="fa fa-align-left fa-2x menu-bar-item black-font"></i>' +
                     '<i id="center-justify" style="font-size: 32px;" class="fa fa-align-center fa-2x menu-bar-item black-font"></i>' +
                     '<i id="right-justify" style="font-size: 32px;" class="fa fa-align-right fa-2x menu-bar-item black-font"></i>' +
                     '<i id="full-width" style="font-size: 32px;" class="fa fa-arrows-h fa-2x menu-bar-item black-font"></i>' +
                     '<i id="full-height" style="font-size: 32px;" class="fa fa-arrows-v fa-2x menu-bar-item black-font"></i>' +
                     '<i id="resize" style="font-size: 32px;" class="fa fa-arrows fa-2x menu-bar-item black-font"></i>' +
                     '<i id="delete-element" style="font-size: 32px;" class="fa fa-close fa-2x menu-bar-item black-font"></i>';
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

