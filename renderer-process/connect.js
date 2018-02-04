const BrowserWindow = require('electron').remote.BrowserWindow
const ipc = require('electron').ipcRenderer

const WINDOW = BrowserWindow.getAllWindows()[0]

console.log('connect restart')
ipc.send('usb.status', WINDOW.id)
ipc.send('serial.status', WINDOW.id)

var connectedButton = document.querySelector('.connected-button')
var connectedStatus = document.querySelector('.connected-status')
var connectedPort = null

connectedButton.addEventListener('mouseenter', function(event) {
  if (connectedButton.classList.contains('disconnected') && !connectedButton.classList.contains('scanning') && !connectedButton.classList.contains('not-found')) {
    connectedStatus.innerHTML = 'Connect'
  } else if (connectedButton.classList.length == 2) {
    connectedStatus.innerHTML = 'Disconnect'
  }
})

connectedButton.addEventListener('mouseleave', function(event) {
  connectedButton.classList.add('with-hover')
  if (connectedButton.classList.contains('disconnected') && !connectedButton.classList.contains('scanning') && !connectedButton.classList.contains('not-found')) {
    connectedStatus.innerHTML = 'Ready'
  } else if (connectedButton.classList.length == 2) {
    connectedStatus.innerHTML = 'Connected'
  }
})

function connect() {
  if (!connectedPort) return
  var baudrateElement = document.getElementById('baudrate')
  var baudrate = baudrateElement.options[baudrateElement.selectedIndex].value
  ipc.send('serial.connect', connectedPort, parseInt(baudrate))
}

connectedButton.addEventListener('click', function(event) {
  connectedButton.classList.remove('with-hover')
  if (connectedButton.classList.contains('disconnected') && !connectedButton.classList.contains('not-found') && !connectedButton.classList.contains('scanning')) {
    connect()
  } else if (connectedButton.classList.length == 1) {
    ipc.send('serial.close')
  }
})

ipc.on('usb.connected', function(event, port) {
  if (connectedButton.classList.contains('scanning') || connectedButton.classList.contains('not-found')) {
    connectedPort = port
    connectedButton.classList.remove('scanning')
    connectedButton.classList.remove('not-found')
    connectedStatus.innerHTML = 'Ready'
  }
})

ipc.on('usb.disconnected', function(event) {
  connectedPort = null
  if (!connectedButton.classList.contains('disconnected')) {
    connectedButton.classList.add('disconnected')
  }
  if (!connectedButton.classList.contains('not-found')) {
    connectedButton.classList.remove('scanning')
    connectedButton.classList.add('not-found')
    connectedStatus.innerHTML = 'Not Found'
  }
})

ipc.on('usb.connect', function(event) {
  connect()
})

ipc.on('serial.open', function(event) {
  connectedButton.classList.remove('disconnected')
  connectedStatus.innerHTML = 'Connected'
})

ipc.on('serial.close', function(event) {
  connectedButton.classList.add("disconnected")
  connectedStatus.innerHTML = connectedPort !== null ? 'Ready' : 'Not Found'
})
