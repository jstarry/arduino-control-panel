const BrowserWindow = require('electron').remote.BrowserWindow
const ipc = require('electron').ipcRenderer

const WINDOW = BrowserWindow.getAllWindows()[0]

ipc.on('serial.open', function(event) {
  WINDOW.setResizable(true)
  WINDOW.setSize(905, 600)
  WINDOW.setMinimumSize(905, 450)
  hideAllSections()
  showNavAndConsole()
  showConnect()
})

ipc.on('serial.close', function(event) {
  WINDOW.setMinimumSize(400, 600)
  WINDOW.setSize(400, 600)
  WINDOW.setResizable(false)
  hideAllSections()
  hideNavAndConsole()
  showConnect()
})

function showMainContent () {
  document.querySelector('main').classList.add('is-shown')
}

function showSection(section) {
  hideAllSections()
  switch (section) {
    case 'connect':
      showConnect()
      break;
    case 'led':
      showLED()
      break;
    case 'stretch':
      showStretch()
      break;
  }
}

function showConnect(event) {
  document.getElementById('connect-section').classList.add('is-shown')
  document.querySelector('.connect-tab').classList.add('active-tab')
  WINDOW.webContents.send('color.change', 'connect-color')
}

function showLED(event) {
  document.getElementById('led-section').classList.add('is-shown')
  document.querySelector('.led-tab').classList.add('active-tab')
  WINDOW.webContents.send('color.change', 'led-color')
}

function showStretch(event) {
  document.getElementById('stretch-section').classList.add('is-shown')
  document.querySelector('.stretch-tab').classList.add('active-tab')
  WINDOW.webContents.send('color.change', 'stretch-color')
}

function showNavAndConsole(event) {
  document.querySelector('nav.sidebar').classList.add('is-shown')
  document.getElementById('console-section').classList.add('is-shown')
}

function hideNavAndConsole(event) {
  document.querySelector('nav.sidebar').classList.remove('is-shown')
  document.getElementById('console-section').classList.remove('is-shown')
}

function hideAllSections(hideConsole=true) {
  document.querySelector('.active-tab').classList.remove('active-tab')
  const sections = document.querySelectorAll('.view-section.is-shown')
  Array.prototype.forEach.call(sections, function (section) {
    section.classList.remove('is-shown')
  })
}

function setupTabs() {
  const tabs = document.querySelectorAll('.nav-tab')
  Array.prototype.forEach.call(tabs, function (tab) {
    tab.addEventListener('click', function(event) {
      if (event.currentTarget.classList.contains('active-tab')) return
      showSection(event.currentTarget.dataset.section)
    })
  })
}

showMainContent()
setupTabs()
