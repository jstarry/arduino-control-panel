const ipc = require('electron').ipcRenderer

function append(str, colorClass, prefix='') {
  str = str.trim()

  let key = ''
  let msgParts = str.split('|')
  if (msgParts.length > 1) key = (msgParts[0] + '-' + msgParts[1]).toLowerCase()
  if (prefix != '') str = prefix + ' - ' + str

  // update prev element if it exists
  if (key != '') {
    const prevEl = document.querySelector('.' + colorClass + '.serial-msg[data-key=' + key + ']')
    if (prevEl) {
      prevEl.innerHTML = str
      return
    }
  }

  // create message element
  const msgEl = document.createElement('span')
  msgEl.classList.add(colorClass)
  msgEl.innerHTML = str
  msgEl.classList.add('serial-msg')
  if (key != '') msgEl.dataset.key = key

  // append message element to output terminal
  const output = document.querySelector('.serial-output')
  output.appendChild(msgEl)
  output.scrollTop = output.scrollHeight
}

function systemMessage(message) {
  append(message, 'system-color', 'SYSTEM')
}

ipc.on('serial.received', function(event, message) {
  append(message, 'connect-color', 'ARDUINO')
})

ipc.on('serial.send', function(event, message) {
  send(message)
})

ipc.on('serial.open', function(event) {
  systemMessage('Connection open')
})

ipc.on('serial.close', function(event) {
  systemMessage('Connection closed')
})

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

var input = document.getElementById('input')
function send(line='') {
  if (line == '') {
    line = input.value
    input.value = ''
  }
  if (line == '') return
  ipc.send('serial.write', line)
  append(line, colorClass, 'CONTROLLER')
}

var clearButton = document.querySelector(".serial-clear");
clearButton.onclick = function() {
  const output = document.querySelector('.serial-output')
  while (output.firstChild) {
    output.removeChild(output.firstChild);
  }
};

let lastSend = ''
sendButton.onclick = function(e) { send(); }
input.onkeydown = function(e) {
  if (e.which == 13) {
    lastSend = input.value
    send()
  } else if (e.which == 38 && input.value == '') {
    input.value = lastSend
  }
}
