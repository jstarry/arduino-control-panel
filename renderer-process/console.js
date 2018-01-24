const BrowserWindow = require('electron').remote.BrowserWindow
const ipc = require('electron').ipcRenderer

var output = document.querySelector('.serial-output')

// TODO figure out how to do multiline keyed elements
function append(str, colorClass, key='') {
  const split = str.trim().split('\r')
  for (var i = 0; i < split.length; i++) {

    // update prev element if it exists
    // TODO only update it if it is the most recent message
    if (key != '') {
      const prevEl = document.querySelector('.serial-msg[data-key=' + key + ']')
      if (prevEl) {
        prevEl.innerHTML = split[i]
        return
      }
    }

    // create message element
    const msgEl = document.createElement('span')
    msgEl.classList.add(colorClass)
    msgEl.innerHTML = split[i]
    msgEl.classList.add('serial-msg')
    if (key != '') msgEl.dataset.key = key

    // append message element to output terminal
    output.appendChild(msgEl)
    output.scrollTop = output.scrollHeight
  }
}

function systemMessage(message) {
  append('SYSTEM - ' + message, 'connect-color')
}

ipc.on('serial.message', function(event, message) {
  const msgParts = message.split("|")
  if (msgParts.length > 1) {
    append(message, colorClass, (msgParts[0] + '-' + msgParts[1]).toLowerCase())
  } else {
    append(message, colorClass)
  }
})

ipc.on('serial.open', function(event) {
  systemMessage('Connection open')
})

ipc.on('serial.close', function(event) {
  systemMessage('Connection closed')
})


var input = document.getElementById('input')
var caret = document.querySelector('.serial-caret')
var sendButton = document.getElementById('send')
var colorClass = 'connect-color'

ipc.on('color.change', function(event, className) {
  sendButton.classList.remove(colorClass)
  caret.classList.remove(colorClass)

  colorClass = className

  sendButton.classList.add(colorClass)
  caret.classList.add(colorClass)
})

function send(line='') {
  if (line == '') {
    line = input.value
    input.value = ''
  }
  if (line == '') return
  line = 'USER - ' + line + '\n'
  BrowserWindow.getFocusedWindow().webContents.send('serial.write', line)
  append(line, colorClass)
}

// var clearButton = document.getElementById("clear");
// clearButton.onclick = function() {
//   while (output.firstChild) {
//     output.removeChild(output.firstChild);
//   }
//};

sendButton.onclick = function(e) { send(); }
input.onkeypress = function(e) {
  if (e.which == 13) {
    send()
  }
}
