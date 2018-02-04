const electron = require('electron')
const app = electron.app
const globalShortcut = electron.globalShortcut
const serial = require('./serial')

app.on('ready', function () {
  globalShortcut.register('CommandOrControl+Shift+K', function () {
    serial.open()
  })
  globalShortcut.register('CommandOrControl+Shift+L', function () {
    serial.close()
  })
})

app.on('will-quit', function () {
  globalShortcut.unregisterAll()
})
