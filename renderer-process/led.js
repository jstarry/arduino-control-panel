require('../vendor/colorpicker.js'); // global
const ipc = require('electron').ipcRenderer
const BrowserWindow = require('electron').remote.BrowserWindow

const WINDOW = BrowserWindow.getAllWindows()[0]

// const COLOR_PICKER = ColorPicker(document.getElementById('color-picker'), function(hex, hsv, rgb) {
//   if (ignoreChangeFromClick) {
//     ignoreChangeFromClick = false
//     return
//   }
//
//   var selectedLED = document.querySelector('.led-light.selected')
//   selectedLED.style.backgroundColor = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.1)'
//   selectedLED.style.borderColor = hex
//   var key = selectedLED.getAttribute('key')
//   WINDOW.webContents.send('serial.send', 'LED|' + key + '|' + hex)
// })

function updateLEDColor(key, hex) {
  const ledEl = document.querySelector(".led-light[key='" + key + "']")
  if (hex == '#000000') {
    ledEl.style.backgroundColor = ''
    ledEl.style.borderColor = ''
  } else {
    const rgb = hex2rgb(hex)
    ledEl.style.backgroundColor = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.1)'
    ledEl.style.borderColor = hex
  }
}

ipc.on('serial.received', function(event, message) {
  message = message.trim()
  const msgParts = message.split('|')
  if (msgParts[0] == 'SET_LED')
    updateLEDColor(msgParts[1], msgParts[2])
})

function selectLight(lightEl) {
  lightEl.classList.add('selected')

  const key = lightEl.getAttribute('key')
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#000000', '', '#FFFFFF', '#00FFFF', '#FFFF00', '#FF00FF']
  const containerEl = lightEl.parentElement
  for (var k = 0; k < 9; k++) {
    const badge = document.createElement('div')
    badge.setAttribute('index', k)
    badge.classList.add('led-badge')
    badge.addEventListener('click', (el) => {
      if (badge.classList.contains('clicked')) return
      badge.classList.add('clicked')
      const index = parseInt(badge.getAttribute('index'))
      WINDOW.webContents.send('serial.send', 'LED|' + key + '|' + colors[index])
      setTimeout(() => {
        badge.classList.remove('clicked')
      }, 100)
    })

    containerEl.insertBefore(badge, containerEl.firstChild)
  }
}

function deselectLight(lightEl) {
  if (lightEl) {
    lightEl.classList.remove('selected')
    containerEl = lightEl.parentElement
    containerEl.classList.remove('animate-to')
    while (containerEl.firstChild) {
      if (containerEl.lastChild == containerEl.firstChild) break
      containerEl.removeChild(containerEl.firstChild)
    }
  }
}

// let ignoreChangeFromClick = false
const lights = document.querySelector('.led-lights')
for (var i = 0; i < 4; i++) {
  for (var j = 0; j < 4; j++) {

    const led = document.createElement('div')
    led.classList.add('led-light')
    led.setAttribute('key', 4 * i + j)
    led.addEventListener('click', (el) => {

      // Deselect old led light
      const oldSelected = document.querySelector('.selected')
      deselectLight(oldSelected)
      if (oldSelected == el.currentTarget) return

      // Select new led light
      selectLight(el.currentTarget)

      // Wait one frame to add class
      window.requestAnimationFrame(() => {
        const parentEl = document.querySelector('.selected').parentElement
        parentEl.classList.add('animate-to')
      })
      // ignoreChangeFromClick = true
      // COLOR_PICKER.setHex(el.currentTarget.style.borderColor)
    })

    const ledContainer = document.createElement('div')
    ledContainer.classList.add('led-container')
    ledContainer.addEventListener('mouseenter', (el) => {
      WINDOW.webContents.send('serial.send', 'HIGHLIGHT|' + el.currentTarget.lastChild.getAttribute('key') + '|ON')
    })
    ledContainer.addEventListener('mouseleave', (el) => {
      WINDOW.webContents.send('serial.send', 'HIGHLIGHT|' + el.currentTarget.lastChild.getAttribute('key') + '|OFF')
    })
    ledContainer.appendChild(led)
    lights.appendChild(ledContainer)
  }
}

// UTILITIES

const hexDigits = new Array('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f')

function rgb2hex(rgb) {
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
  return '#' + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3])
}

function hexVal(hex) {
  const charcode = hex.charCodeAt(0)
  const a = 'a'.charCodeAt(0)
  const f = 'f'.charCodeAt(0)
  if ((charcode - a) >= 0 && (charcode - f) <= 0) return 10 + (charcode - a)
  return parseInt(hex)
}

function hex2rgb(hex) {
  hex = hex.toLowerCase()
  const r = hexVal(hex[1]) * 16 + hexVal(hex[2])
  const g = hexVal(hex[3]) * 16 + hexVal(hex[4])
  const b = hexVal(hex[5]) * 16 + hexVal(hex[6])
  return [r, g, b]
}

function hex(x) {
  return isNaN(x) ? '00' : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16]
}
