'use strict';

// GLOBAL VARIABLES
var newElement;
var elements = [];
var latestZindex;

getElementsFromLocalStorage();

// FUNCTIONS

function createNewElement(position) {
  var newElement = document.createElement('div');
  newElement.classList.add('absolute');
  newElement.setAttribute('id', elements.length);
  addStyles(newElement, {
    'border': '1px solid black',
    'top': position.topLeft.y + 'px',
    'left': position.topLeft.x + 'px',
    'bottom': document.body.scrollHeight - position.bottomRight.y + 'px',
    'right': document.body.scrollWidth - position.bottomRight.x + 'px',
    'fontSize': '16px',
    'zIndex': latestZindex,
    'cursor': 'move'
  });
  insertElementIntoBody(newElement);
  var savedElement = {
    border: newElement.style.border,
    top: newElement.style.top,
    left: newElement.style.left,
    bottom: newElement.style.bottom,
    right: newElement.style.right,
    fontSize: newElement.style.fontSize,
    cursor: newElement.style.cursor
  }
  elements.push(savedElement);
  window.localStorage.setItem('wirez', JSON.stringify(elements));
  console.log('els', elements);
  createElementTextarea(newElement);
  $('.absolute').draggable({start: jQueryDraggableStart, stop: jQueryDraggableStop});
}

function insertElementIntoBody(element) {
  document.body.insertBefore(element, document.getElementById('firstscript'));
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

// arguments: (elementVar, {styleName: styleValue, styleName: styleValue, etc})
// applies styles and innerText and HTML attributes to an element.
function addStyles(element, styles) {
  for (var key in styles) {
    if (key === 'innerText') element.innerText = styles[key];
    else if (key.match(/^attr:/)) element.setAttribute(key.split(':')[1], styles[key]);
    else element.style[key] = styles[key];
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

// updating a saved element with new user chosen styles or text.
// the property argument is 'innerText', 'style', or 'attribute'.
// if property is 'style', value is {styleName: value, styleName: value, etc}
// if property is 'innerText' or 'attribute', value is a string.
function updateSavedElement(element, property, value) {
  if (property === 'innerText')
    elements[element.getAttribute('id')][property] = value;
  else if (property === 'style')
    for (var key in value) elements[element.getAttribute('id')][key] = value[key];
  else if (property === 'attribute')
    for (var key in value) elements[element.getAttribute('id')]['attr:'+key] = value[key];
  window.localStorage.setItem('wirez', JSON.stringify(elements));
}

// deletes an element using the element menu bar delete button.
// Deletes it from the saved elements model, saves new elements array to
// localStorage, and updates the id's of all the elements in the DOM that
// appear later in the saved elements array.
function deleteElement(elementId) {
  elements.splice(elementId, 1);
  window.localStorage.setItem('wirez', JSON.stringify(elements));
  // Note: querySelectorAll returns a NodeList which is different than an array
  // and the filter() method doesn't work on it, but the following line of
  // code returns an array I can use filter() on! hooray!
  var userMadeElements = Array.prototype.slice.call(document.querySelectorAll('.absolute'));
  var elementsToUpdate = userMadeElements.filter(function(el) {
    return el.getAttribute('id') > elementId;
  });
  elementsToUpdate.forEach(function(el) {
    el.setAttribute('id', el.getAttribute('id')-1);
  });
}

function getElementsFromLocalStorage() {
  latestZindex = JSON.parse(window.localStorage.getItem('wirezZindex')) || 1;
  elements = JSON.parse(window.localStorage.getItem('wirez')) || [];
  if (elements.length) {
    var rebornElements = [];
    for (var i = 0; i<elements.length; i++) {
      rebornElements.push(document.createElement('div'));
      rebornElements[i].classList.add('absolute');
      rebornElements[i].setAttribute('id', i);
      addStyles(rebornElements[i], elements[i]);
      insertElementIntoBody(rebornElements[i]);
    }
  }
}


