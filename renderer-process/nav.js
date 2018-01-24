const BrowserWindow = require('electron').remote.BrowserWindow
const ipc = require('electron').ipcRenderer

const WINDOW = BrowserWindow.getAllWindows()[0]

ipc.on('serial.open', function(event) {
  WINDOW.setSize(905, 600)
  WINDOW.setMinimumSize(905, 450)
  WINDOW.setResizable(true)
  showNavAndConsole()
  showConnect()
})

ipc.on('serial.close', function(event) {
  WINDOW.setSize(400, 600)
  WINDOW.setMinimumSize(400, 600)
  WINDOW.setResizable(false)
  hideNavAndConsole()
  showConnect()
})

function showMainContent () {
  document.querySelector('.js-content').classList.add('is-shown')
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
  }
}

function showConnect(event) {
  document.getElementById('connect-section').classList.add('is-shown')
  WINDOW.webContents.send('color.change', 'connect-color')
}

function showLED(event) {
  document.getElementById('led-section').classList.add('is-shown')
  WINDOW.webContents.send('color.change', 'led-color')
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
  const sections = document.querySelectorAll('.js-section.is-shown')
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
      const oldActive = document.querySelector('.active-tab')
      if (oldActive) oldActive.classList.remove('active-tab')
      event.currentTarget.classList.add('active-tab')
    })
  })
}

showMainContent()
setupTabs()
