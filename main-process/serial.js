const ipc = require('electron').ipcMain
const BrowserWindow = require('electron').BrowserWindow
const SerialPort = require('serialport')
const Readline = SerialPort.parsers.Readline

let serialport = null
let listener = null

ipc.on('serial.status', function(event, fromWindowId) {
  listener = BrowserWindow.fromId(fromWindowId).webContents
  listener.send(serialport == null ? 'serial.close' : 'serial.open')
})

ipc.on('serial.close', function(event) {
  serialport.close((e) => {})
})

ipc.on('serial.write', function(event, data) {
  if (serialport) {
    serialport.write(data + "\n")
  }
})

ipc.on('serial.connect', function(event, port, baudRate) {
  serialport = new SerialPort(port, {baudRate, lock: false})

  serialport.on('open', function() {
    listener.send('serial.open')
  })

  serialport.on('close', function() {
    listener.send('serial.close')
    serialport = null
  })

  serialport.on('error', function(err) {
    console.error(string)
  })

  serialport.pipe(new Readline()).on('data', function(message) {
    listener.send('serial.received', message)
  })
})

const debug = /--debug/.test(process.argv[2])

module.exports = {
  open: function() {
    if (serialport) return
    listener.send('usb.connect')
    if (debug) {
      setTimeout(() => {
        if (!serialport) listener.send('serial.open')
      }, 100)
    }
  },
  close: function() {
    if (serialport) serialport.close((e) => {})
    listener.send('serial.close')
  }
}
