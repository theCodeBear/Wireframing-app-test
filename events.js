'use strict';

// THIS HOLDS ALL THE EVENT HANDLERS FOR THE APPLICATION

var topLeft = {x: 0, y: 0}, bottomRight = {x: 0, y: 0};
var menuWidth = 340;
var menuTop = -260;
var resizing = false;
var hadBorder = false;
var intervalId;
var pageTitle;

createPageMenu();

(function($) {
  $('.absolute').draggable({start: jQueryDraggableStart, stop: jQueryDraggableStop});
})(jQuery);

function jQueryDraggableStart(event) {
  event.target.style.zIndex = ++latestZindex;
  window.localStorage.setItem('wirezZindex', latestZindex);
}
function jQueryDraggableStop(event) {
  event.target.style.bottom = computeBottomOrRightStyle(event.target.style.top, event.target.style.height, 'none', document.body.scrollHeight);
  event.target.style.right = computeBottomOrRightStyle(event.target.style.left, event.target.style.width, event.target.style.border, document.body.scrollWidth);
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

document.body.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.keyCode === 77) {
    Array.prototype.slice.call(document.querySelectorAll('.absolute')).forEach(function(el) {
      el.classList.add('dark-and-blurry');
    });
    document.getElementById('page-menu').style.zIndex = latestZindex;
    document.getElementById('page-menu').style.display = 'initial';
  }
});


function togglePageModeHandler(event) {
  if (event.path[0].classList.contains('not-selected')) {
    Array.prototype.slice.call(document.querySelectorAll('.page-menu-toggle-button')).forEach(
      function(el) {
        el.classList.toggle('not-selected');
        el.classList.toggle('selected');
      }
    );
    document.getElementById('page-menu').querySelector('.not-selected').removeEventListener('click', togglePageModeHandler);
    document.getElementById('page-menu').querySelector('.not-selected').addEventListener('click', togglePageModeHandler);
  }
}

function pageMenuIconsHandler(event) {
  copyIcon(event.path[0]);
}

function pageMenuBackgroundColorEventCaller() {
  document.getElementById('body-backgroundcolor').addEventListener('change', function(event) {
    document.body.style.backgroundColor = event.path[0].value;
    window.localStorage.setItem('wirezBody', document.body.style.backgroundColor);
  });
}


document.body.addEventListener('mousedown', function(event) {
  topLeft.x = event.clientX;
  topLeft.y = event.clientY;
  // code for drawing outline of element as user drags while creating element:
  if (event.path[0].tagName === 'BODY') {
    var outlineElement = document.createElement('div');
    outlineElement.setAttribute('id', 'outline-element');
    addStyles(outlineElement, {
      border: '1px dashed black',
      position: 'absolute',
      top: topLeft.y+'px',
      left: topLeft.x+'px'
    });
    document.body.appendChild(outlineElement);
    intervalId = window.setInterval(function() {
      document.body.addEventListener('mousemove', mousemoveHandler);
    });
  }
});

function mousemoveHandler(event, outlineElement) {
  var outlineElement = document.querySelector('#outline-element');
  outlineElement.style.width = event.pageX - outlineElement.style.left.slice(0,-2) + 'px';
  outlineElement.style.height = event.pageY - outlineElement.style.top.slice(0,-2)+ 'px';
  document.body.removeEventListener('mousemove', mousemoveHandler);
}

document.body.addEventListener('mouseup', mouseUp);

function mouseUp(event) {
  var element = event.path[0];
  document.body.removeEventListener('mousemove', mousemoveHandler);
  if (document.getElementById('outline-element')) {
    document.body.removeChild(document.querySelector('#outline-element'));
    window.clearInterval(intervalId);
  }
  if (!resizing && !event.path[0].classList.contains('ui-draggable-dragging')) {
    bottomRight.x = event.clientX;
    bottomRight.y = event.clientY;
    if (elementIsBigEnough({topLeft, bottomRight}))
      createNewElement({topLeft, bottomRight});
  }
  // if a menu bar exists and a click is made not on it or its options, close menu bar
  if ((document.querySelector('.element-menu') && !element.classList.contains('element-menu')) ||
      (document.querySelector('.icon-menu') && !element.classList.contains('icon-menu')) &&
      !element.classList.contains('menu-bar-item')) {
    closeElementMenuBar();
  }
}



// Handles clicking to create and destroy element menu bars
document.body.addEventListener('click', function(event) {
  var element = event.path[0];
  if (element.tagName === 'IMG') element = element.parentNode;
  // console.log(element);
  // if the resize button on the menu bar has been clicked and the user clicks off that element, turn resize off
  if (resizing && !element.classList.contains('resize') && element.getAttribute('id') !== 'resize') {
    resizing = false;
    $('.absolute').draggable('enable');
    var resizedElement = document.querySelector('.resize');
    resizedElement.style.border = (hadBorder) ? '1px solid black' : 'none';
    resizedElement.classList.remove('resize');
    resizedElement.style.bottom = computeBottomOrRightStyle(resizedElement.style.top, resizedElement.style.height, resizedElement.style.border, document.body.scrollHeight);
    resizedElement.style.right = computeBottomOrRightStyle(resizedElement.style.left, resizedElement.style.width, resizedElement.style.border, document.body.scrollWidth);
    updateSavedElement(resizedElement, 'style', {
      bottom: resizedElement.style.bottom,
      right: resizedElement.style.right
    });
  // if an element has attribute 'data-link-textfield' and clicks on another element that isn't the link button,
  // then destroy text field and link to given value on double click of element
  } else if (document.querySelector('[data-link-textfield="true"]') && element.getAttribute('id') !== 'link') {
    var textField = document.getElementById('linkField');
    var linkedDiv = document.querySelector('[data-link-textfield="true"]');
    var linkTo = textField.value;
    linkedDiv.removeAttribute('data-link-textfield');
    linkedDiv.removeChild(textField);
    linkedDiv.setAttribute('ondblclick', 'createLink("'+textField.value+'")');
    updateSavedElement(linkedDiv, 'attribute', {ondblclick: linkedDiv.getAttribute('ondblclick')});
  // if an element has attribute 'data-img-textfield' and clicks on another element that isn't the img button,
  // then destroy text field and create img element in div with the inputted url
  } else if (document.querySelector('[data-img-textfield="true"]') && element.getAttribute('id') !== 'add-image') {
    var textField = document.getElementById('imgField');
    var containingDiv = document.querySelector('[data-img-textfield="true"]');
    var imgUrl = textField.value.trim();
    containingDiv.removeAttribute('data-img-textfield');
    containingDiv.removeChild(textField);
    // if there is image url input and div has no img tag
    if (imgUrl && !containingDiv.contains(document.querySelector('img'))) {
      var img = document.createElement('img');
      img.setAttribute('src', imgUrl);
      addStyles(img, {
        position: 'absolute',
        top: 0,
        left: 0,
        maxWidth: '100%',
        maxHeight: '100%',
        zIndex: containingDiv.style.zIndex - 1
      });
      updateTextNode(containingDiv, '');
      containingDiv.appendChild(img);
      containingDiv.setAttribute('has-image-child', imgUrl);
      updateSavedElement(containingDiv, 'attribute', {'has-image-child': imgUrl});
      updateSavedElement(containingDiv, 'innerText', containingDiv.innerText);
    // if there is image url input and div already has an img tag
    } else if (imgUrl && containingDiv.contains(document.querySelector('img'))) {
      containingDiv.getElementsByTagName('img')[0].setAttribute('src', imgUrl);
      updateSavedElement(containingDiv, 'attribute', {'has-image-child': imgUrl});
    // if there is no image url input and div already has an img tag
    } else if (containingDiv.contains(document.querySelector('img'))) {
      containingDiv.removeAttribute('has-image-child');
      containingDiv.removeChild(containingDiv.getElementsByTagName('img')[0]);
      updateSavedElement(containingDiv, 'attribute', {'has-image-child': ''});
    }
  }
  // Brings up element menu bar. Happens when user clicks an element and neither element or page menus are open
  if (element.classList.contains('absolute') &&
      document.querySelector('#page-menu').style.display==='none' &&
      !document.querySelector('.element-menu')) {
    var elMenu;
    element.style.zIndex = ++latestZindex;
    window.localStorage.setItem('wirezZindex', latestZindex);
    updateSavedElement(element, 'style', {zIndex: element.style.zIndex});
    var menuContainer = createElMenuContainer(element);
    // if element is not an icon, else element is an icon
    if (!element.classList.contains('fa')) elMenu = createElementMenu();
    else elMenu = createIconMenu();
    menuContainer.appendChild(elMenu);
    addElementMenuBarListeners(element);
  }
});

function addTextareaListener() {
  document.querySelector('#temporaryInput').addEventListener('blur', function(event) {
    var textarea = event.path[0];
    var element = textarea.parentNode;
    var input = textarea.value.trim();
    updateTextNode(element, input);
    updateSavedElement(event.path[1], 'innerText', input);
    if (element.querySelector('img') && !input)
      element.querySelector('img').style.visibility = 'visible';
    else if (element.querySelector('img') && input) {
      element.removeChild(element.querySelector('img'));
      element.removeAttribute('has-image-child');
      updateSavedElement(element, 'attribute', {'has-image-child': ''});
    }
    textarea.parentNode.removeChild(textarea);
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
  makeCircleListener(element);
  addImageListener(element);
  linkListener(element);
  deleteElementListener(element);
}

// ELEMENT MENU BAR CLICK LISTENERS
function editTextListener(element) {
  document.querySelector('#edit-text').addEventListener('click', function() {
    var text = element.innerText;
    updateTextNode(element, '');
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
    if (element.classList.contains('fa'))
      addStyles(element, {'width': element.style.fontSize, 'height': element.style.fontSize});
    updateSavedElement(element, 'style', {
      fontSize: element.style.fontSize,
      height: element.style.height,
      width: element.style.width
    });
  });
}
function largerFontListener(element) {
  document.querySelector('#larger-font').addEventListener('click', function() {
    element.style.fontSize = + element.style.fontSize.slice(0,-2) + 4 + 'px';
    if (element.classList.contains('fa'))
      addStyles(element, {'width': element.style.fontSize, 'height': element.style.fontSize});
    updateSavedElement(element, 'style', {
      fontSize: element.style.fontSize,
      height: element.style.height,
      width: element.style.width
    });
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
    // fixes a bug that sometimes a piece of the menu bar still shows after resizing
    document.querySelector('.element-menu').style.visibility = 'hidden';
  });
}
function makeCircleListener(element) {
  document.querySelector('#circular').addEventListener('click', function() {
    element.style.borderRadius = (!element.style.borderRadius || element.style.borderRadius === '0px') ? '50%' : '0px';
    if (element.querySelector('img')) element.querySelector('img').style.borderRadius = element.style.borderRadius;
    updateSavedElement(element, 'style', {borderRadius: element.style.borderRadius});
  });
}
function addImageListener(element) {
  document.querySelector('#add-image').addEventListener('click', createTempTextfield.bind(this, element, 'imgField'));
}
function linkListener(element) {
  document.querySelector('#link').addEventListener('click', createTempTextfield.bind(this, element, 'linkField'));
}
function deleteElementListener(element) {
  document.querySelector('#delete-element').addEventListener('click', function() {
    deleteElement(element.getAttribute('id'));
    element.parentNode.removeChild(element);
  });
}


// RELATED FUNCTIONS

function copyIcon(element) {
  var newIcon = element.cloneNode();
  newIcon.setAttribute('id', elements.length);
  newIcon.classList.remove('page-menu-icons');
  newIcon.classList.add('absolute');
  addStyles(newIcon, {
    zIndex: latestZindex,
    top: 0,
    left: 0,
    height: '32px',
    width: '32px',
    fontSize: '32px',
    cursor: 'move'
  });
  insertElementIntoBody(newIcon);
  elements.push(newIcon);
  updateSavedElement(newIcon, 'style', {
    zIndex: newIcon.style.zIndex,
    top: newIcon.style.top,
    left: newIcon.style.left,
    height: newIcon.style.height,
    width: newIcon.style.width,
    fontSize: newIcon.style.fontSize,
    cursor: newIcon.style.cursor
  });
  updateSavedElement(newIcon, 'attribute', {
    'data-icon': newIcon.classList.toString().match(/fa-\w+/)
  });
  // window.localStorage.setItem('wirez', JSON.stringify(elements));
  $('.absolute').draggable({start: jQueryDraggableStart, stop: jQueryDraggableStop});
}

function createLink(link) {
  return window.location = link;
}

// creates temporary text input field in element when link or image menu buttons are clicked.
// takes as arguments the element and the id for either the input field ('linkField' or 'imgField')
function createTempTextfield(element, inputId) {
  var textField = document.createElement('input');
  textField.setAttribute('type', 'text');
  textField.setAttribute('id', inputId);
  if (inputId === 'linkField') {
    textField.setAttribute('placeholder', 'URL to link to...');
    textField.setAttribute('value', element.getAttribute('ondblclick') ? element.getAttribute('ondblclick').split('"')[1] : '');
    element.setAttribute('data-link-textfield', 'true');
  } else if (inputId === 'imgField') {
    textField.setAttribute('placeholder', 'URL to image...');
    element.setAttribute('data-img-textfield', 'true');
    if (element.contains(document.querySelector('img')))
      textField.setAttribute('value', element.getElementsByTagName('img')[0].getAttribute('src'));
  }
  addStyles(textField, {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 0,
    border: 0,
    textAlign: 'center',
    borderRadius: element.style.borderRadius,
    outline: 'none',
    zIndex: element.style.zIndex
  });
  element.appendChild(textField);
  textField.focus();
}

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
function computeBottomOrRightStyle(topOrLeft, heightOrWidth, border, scrollHeightOrWidth) {
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

function closePageMenu() {
  Array.prototype.slice.call(document.querySelectorAll('.absolute')).forEach(function(el) {
      el.classList.remove('dark-and-blurry');
    });
  window.history.pushState('', '', document.getElementById('page-url').value);  // just changing the url in the browser right now, not actually saving data to the new url address
  pageTitle = document.getElementById('page-title').value;
  document.getElementById('page-menu').style.display = 'none';
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

function createElementMenu() {
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
                     '<i id="circular" style="font-size: 32px;" class="fa fa-genderless fa-2x menu-bar-item black-font"></i>' +
                     '<i id="add-image" style="font-size: 32px;" class="fa fa-image fa-2x menu-bar-item black-font"></i>' +
                     '<i id="link" style="font-size: 32px;" class="fa fa-link fa-2x menu-bar-item black-font"></i>' +
                     '<i id="delete-element" style="font-size: 32px;" class="fa fa-close fa-2x menu-bar-item black-font"></i>';
  return elMenu;
}

function createIconMenu() {
  var elMenu = document.createElement('div');
  elMenu.style.cursor = 'initial';
  elMenu.classList.add('icon-menu');
  elMenu.innerHTML = '<i id="font-weight" style="font-size: 32px;" class="fa fa-text-width fa-2x menu-bar-item black-font"></i>' +
                     '<i style="font-size: 32px;" class="fa fa-font fa-2x menu-bar-item"><input id="font-color" type="color" class="menu-bar-item text-color-input menu-color-pickers"></i>' +
                     '<i id="smaller-font" style="font-size: 21.3333px;" class="fa fa-font fa-lg menu-bar-item black-font"></i>' +
                     '<i id="larger-font" style="font-size: 48px;" class="fa fa-font fa-3x menu-bar-item black-font"></i>' +
                     '<i id="link" style="font-size: 32px;" class="fa fa-link fa-2x menu-bar-item black-font"></i>' +
                     '<i id="delete-element" style="font-size: 32px;" class="fa fa-close fa-2x menu-bar-item black-font"></i>';
  return elMenu;
}

function createPageMenu() {
  var menu = document.createElement('div');
  addStyles(menu, {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    textAlign: 'center',
    fontSize: '32px',
    fontWeight: 900,
    color: 'white',
    zIndex: latestZindex,
    display: 'none',
    backgroundColor: 'rgba(0,0,0,0.8)'
  });
  menu.setAttribute('id', 'page-menu');
  menu.innerHTML = '<p>PAGE MENU</p>' +
                   '<label class="page-menu-label">Page Title</label><input id="page-title" type="text" class="page-menu-input" placeholder="Page Title">' +
                   '<label class="page-menu-label">Page URL Path</label><input id="page-url" type="text" class="page-menu-input" placeholder="Page URL Path">' +
                   '<label class="page-menu-label">Background Color</label><input id="body-backgroundcolor" type="color" class="page-menu-input" value="#FFFFFF">' +
                   '<label class="page-menu-label">Use Popular Icons</label>' +
                   '<div>' +
                   '<i class="fa fa-bars page-menu-icons"></i>' +
                   '<i class="fa fa-comment page-menu-icons"></i>' +
                   '<i class="fa fa-chevron-left page-menu-icons"></i>' +
                   '<i class="fa fa-plus-circle page-menu-icons"></i>' +
                   '<i class="fa fa-minus-circle page-menu-icons"></i>' +
                   '<i class="fa fa-remove page-menu-icons"></i>' +
                   '<i class="fa fa-search page-menu-icons"></i>' +
                   '<i class="fa fa-star page-menu-icons"></i>' +
                   '<i class="fa fa-heart page-menu-icons"></i>' +
                   '<i class="fa fa-user page-menu-icons"></i>' +
                   '</div>' +
                   '<label class="page-menu-label">Page Mode</label>' +
                   '<div><button class="page-menu-toggle-button selected">View</button>' +
                   '<button class="page-menu-toggle-button not-selected">Edit</button></div>' +
                   // '<label for="view" class="page-menu-toggle-label">View</label><input type="checkbox" name="view">' +
                   // '<label for="edit" class="page-menu-toggle-label">Edit</label><input type="checkbox" name="edit">' +
                   '<button class="close-page-menu" onclick="closePageMenu()">Close</button>';
  document.body.appendChild(menu);
  menu.querySelector('#body-backgroundcolor').value = rgbToHex(document.body.style.backgroundColor);
  pageMenuBackgroundColorEventCaller();
  menu.querySelector('.not-selected').addEventListener('click', togglePageModeHandler);
  Array.prototype.slice.call(menu.querySelectorAll('.page-menu-icons')).forEach(function(el) {
    el.addEventListener('click', pageMenuIconsHandler);
  });
}

function rgbToHex(rgb) {
  var rgbArray = rgb.split(/[()]/)[1].split(/,\s*/);
  rgbArray = rgbArray.map(function(el) {
    el = parseInt(el).toString(16);
    return (el==='0') ? '00' : el;
  });
  return '#'+rgbArray[0]+rgbArray[1]+rgbArray[2];
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
  // if menu would be offscreen above and below the screen, move menu to middle of parent element
  if (userElement.style.top.slice(0,-2) <= -menuTop && userElement.style.bottom.slice(0,-2) <= -menuTop)
    menuTop = window.getComputedStyle(userElement).getPropertyValue('height').slice(0,-2) / 2;
  // if menu would be off the menuTop of the screen, move to underneath parent element
  else if (userElement.style.top.slice(0,-2) <= -menuTop)
    menuTop = + window.getComputedStyle(userElement).getPropertyValue('height').slice(0,-2) + 20;
  return menuTop;
}

