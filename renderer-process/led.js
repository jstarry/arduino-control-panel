require('../vendor/colorpicker.js'); // global
const BrowserWindow = require('electron').remote.BrowserWindow

const WINDOW = BrowserWindow.getAllWindows()[0]

var ignoreChangeFromClick = false;
var cp = ColorPicker(document.getElementById("color-picker"), function(hex, hsv, rgb) {
  if (ignoreChangeFromClick) {
    ignoreChangeFromClick = false;
    return;
  }
  var selectedLED = document.querySelector(".selected");
  selectedLED.style.backgroundColor = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.1)'
  selectedLED.style.borderColor = hex
  var selectedStar = document.querySelector(".selected svg");
  selectedStar.style.color = 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')'
  var key = selectedLED.getAttribute('key');
  WINDOW.webContents.send('serial.message', "LED|" + key + "|" + hex);
});

var hexDigits = new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");

//Function to convert rgb color to hex format
function rgb2hex(rgb) {
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function hex(x) {
  return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}

var lights = document.querySelector(".led-lights")
for (var i = 0; i < 4; i++) {
  for (var j = 0; j < 4; j++) {
    var led = document.createElement("div");
    if (i == 0 && j == 0) {
      led.classList.add('selected');
    }

    led.classList.add('led-light')
    var starIcon = document.createElement("i")
    starIcon.classList.add('fas', 'fa-star')
    led.appendChild(starIcon)
    led.setAttribute('key', 4 * i + j)
    led.style.borderColor = '#CCC'
    led.firstChild.style.color = 'rgb(204,204,204)'
    led.addEventListener('click', (el) => {
      var previous = document.querySelector(".selected");
      previous.classList.remove("selected");
      el.currentTarget.classList.add("selected");
      ignoreChangeFromClick = true;
      cp.setHex(rgb2hex(el.currentTarget.style.borderColor))
    });
    lights.appendChild(led);
  }
  lights.appendChild(document.createElement("br"));
}
