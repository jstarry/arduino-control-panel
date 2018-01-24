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
  serialport.write(data)
})

ipc.on('serial.connect', function(event, port, baudrate) {
  serialport = new SerialPort(port, {
    baudRate: baudrate,
    lock: false
  }, true)

  serialport.on('open', function() {
    listener.send('serial.open')
  })

  serialport.on('close', function(string) {
    listener.send('serial.close')
    serialport = null
  })

  serialport.on('error', function(string) {
    console.error(string)
  })

  //const parser = ; //{ delimiter: '\r\n' }
  let buildData = ''
  serialport.pipe(new Readline()).on('data', function(data) {
    const message = buildData + data.toString()
    if (message.last == '\n' || message.last == '\r') {
      buildData = ''
    } else {
      buildData = message
      return
    }

    conosle.log(message)
    listener.send('serial.message', message)
  })
})
