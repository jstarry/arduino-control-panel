const ipc = require('electron').ipcRenderer

ipc.on('serial.received', function(event, message) {
  message = message.trim()
  const msgParts = message.split('|')
  if (msgParts[0] == 'RES')
    updateResistance(msgParts[1])
})

const resistanceEl = document.querySelector(".resistance-value")
const stretchEl = document.querySelector(".stretch-tracker")
const minCalibrationEl = document.querySelector(".min-calibration")
const calibrationEl = document.querySelector(".calibration")

function updateResistance(resistance) {
  var val = 1000 * parseInt(resistance)
  if (val >= 10000) {
    resistance = "" + Math.floor(val / 1000) + "K"
  } else {
    resistance = "" + val
  }
  resistance += " Ohms"
  resistanceEl.innerHTML = resistance
  var minResistance = parseFloat(minCalibrationEl.value)
  var widthRatio = 1.0 - ((val * 1.0 - minResistance) / (parseFloat(calibrationEl.value) - minResistance))
  var percent = Math.max(1, Math.floor(100 * Math.min(1.0, widthRatio)))
  var percentStr = "" + percent + "%"
  stretchEl.style.width = percentStr
}
