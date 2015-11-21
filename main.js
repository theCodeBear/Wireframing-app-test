'use strict';

// GLOBAL VARIABLES
// var nthElement = 1;
var newElement;
var elements = [];


// FUNCTIONS

function createNewElement(position) {
  var newElement = document.createElement('div');
  // newElement.innerText = nthElement++;
  newElement.classList.add('absolute');
  addStyles(newElement, {
    'border': '1px solid black',
    'top': position.topLeft.y + 'px',
    'left': position.topLeft.x + 'px',
    'bottom': document.body.scrollHeight - position.bottomRight.y + 'px',
    'right': document.body.scrollWidth - position.bottomRight.x + 'px',
    'fontSize': '16px'
  });
  insertElementIntoBody(newElement);
  var savedElement = {
    border: newElement.style.border,
    top: newElement.style.top,
    left: newElement.style.left,
    bottom: newElement.style.bottom,
    right: newElement.style.right,
    fontSize: newElement.style.fontSize
  }
  elements.push(savedElement);
  console.log('els', elements);
  createElementTextarea(newElement);
}

function insertElementIntoBody(element) {
  document.body.insertBefore(element, document.getElementById('mainjs'));
}

function createElementTextarea(element, text) {
  var textarea = document.createElement('textarea');
  textarea.innerText = text ? text : '';
  textarea.setAttribute('placeholder', 'Type something...');
  addStyles(textarea, {
    'width': '100%',
    'height': '100%',
    'resize': 'none',
    'border': 'none',
    'padding': '0',
    'fontSize': '16px'
  });
  textarea.setAttribute('id', 'temporaryInput');
  element.appendChild(textarea);
  textarea.focus();
  addTextareaListener();
}

function addStyle(element, styleName, styleValue) {
  element.style[styleName] = styleValue;
}

// arguments: (elementVar, [{styleName, styleValue}])
function addStyles(element, styles) {
  for (var key in styles) {
    element.style[key] = styles[key];
  }
}

// Used to only make element if at least one dimension is larger than 20px.
// And also to make sure element creation is done from top left to bottom right.
// return true if big enough, false otherwise.
function elementIsBigEnough(position) {
  var width = position.bottomRight.x - position.topLeft.x;
  var height = position.bottomRight.y - position.topLeft.y;
  var leftToRight = position.bottomRight.x > position.topLeft.x;
  var topToBottom = position.bottomRight.y > position.topLeft.y;
  return (width > 20 || height > 20) && leftToRight && topToBottom;
}

function bringBackAllElements() {
  var rebornElements = [];
  for (var i = 0; i<elements.length; i++) {
    rebornElements.push(document.createElement('div'));
    rebornElements[i].classList.add('absolute');
    addStyles(rebornElements[i], elements[i]);
    insertElementIntoBody(rebornElements[i]);
  }
}


