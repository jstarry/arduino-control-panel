require('./vendor/colorpicker.js'); // global
var SerialPortLib = require('browser-serialport');
var SerialPort = SerialPortLib.SerialPort;

var PortPoller = setInterval(function() {
  SerialPortLib.list(function(err, ports) {
    var statusButton = document.querySelector(".connected-button");
    var connectedStatus = document.querySelector(".connected-status");

    for (var i = 0; i < ports.length; i++) {
      var comName = ports[i].comName;
      if (comName.toLowerCase().indexOf("cu.usb") !== -1) {
        document.querySelector(".port-input").value = comName;
        if (statusButton.classList.contains("scanning") || statusButton.classList.contains("not-found")) {
          statusButton.classList.remove("scanning");
          statusButton.classList.remove("not-found");
          connectedStatus.innerHTML = "USB Ready";
        }
        return;
      }
    }

    if (!statusButton.classList.contains("disconnected")) {
      statusButton.classList.add("disconnected");
    }
    if (!statusButton.classList.contains("not-found")) {
      statusButton.classList.remove("scanning");
      statusButton.classList.add("not-found");
      connectedStatus.innerHTML = "USB Not Found";
    }
  });
}, 1000);

var sp;
var output;

function append(str, color="#555", background="#EEE") {
  var split = str.trim().split("\r");
  for (var i = 0; i < split.length; i++) {
    var msgEl = document.createElement("span");
    msgEl.style.color = color;
    msgEl.style.background = background;
    msgEl.innerHTML = split[i];
    msgEl.classList.add("serial-msg");

    output.appendChild(msgEl);;
    output.scrollTop = output.scrollHeight;
  }
}

function send(line='') {
  if (line == "") {
    line = input.value;
    input.value = "";
  }
  if (line == "") return;
  line += "\n";
  sp.write(line);
  append(line, "#EEE", "rgb(23,161,165)");
}


window.onload = function() {
  output = document.querySelector(".serial-output");
  var connectedButton = document.querySelector(".connected-button");
  var connectedStatus = document.querySelector(".connected-status");
  connectedButton.addEventListener("mouseenter", function(event) {
    if (connectedButton.classList.contains("disconnected") && !connectedButton.classList.contains("scanning") && !connectedButton.classList.contains("not-found")) {
      connectedStatus.innerHTML = "Connect";
    } else if (connectedButton.classList.length == 1) {
      connectedStatus.innerHTML = "Disconnect";
    }
  });
  connectedButton.addEventListener("mouseleave", function(event) {
    if (connectedButton.classList.contains("disconnected") && !connectedButton.classList.contains("scanning") && !connectedButton.classList.contains("not-found")) {
      connectedStatus.innerHTML = "USB Ready";
    } else if (connectedButton.classList.length == 1) {
      connectedStatus.innerHTML = "Connected";
    }
  });
  connectedButton.addEventListener("click", function(event) {
    if (connectedButton.classList.contains("disconnected") && !connectedButton.classList.contains("not-found") && !connectedButton.classList.contains("scanning")) {
      var port = document.querySelector(".port-input").value;
      var baudrateElement = document.getElementById("baudrate");
      var baudrate = baudrateElement.options[baudrateElement.selectedIndex].value;
      connect(port, baudrate);
    } else if (connectedButton.classList.length == 1) {
      sp.close((e) => {});
    }
  });

  var backButton = document.querySelector(".app-back");
  backButton.addEventListener("click", function(e) {
    document.querySelector(".active.app-container").classList.remove("active");
    document.querySelector(".app-picker-container").style.display = "flex";
    backButton.style.display = "none";
  });

  var cp = ColorPicker(document.getElementById("color-picker"), function(hex, hsv, rgb) {
    if (ignoreGlobal) {
      ignoreGlobal = false;
      return;
    }
    var selectedLED = document.querySelector(".selected");
    selectedLED.style.backgroundColor = hex;
    selectedLED.style.boxShadow = "0px 0px 15px 2px " + hex;
    var key = selectedLED.getAttribute('key');
    var autoSend = document.querySelector(".auto-send").checked;
    var sendString = "LED|" + key + "|" + hex;
    if (autoSend) {
      send(sendString);
    } else {
      var sendInput = document.querySelector(".serial-text");
      sendInput.value = sendString;
    }
  });

  var hexDigits = new Array
  ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");

  //Function to convert rgb color to hex format
  function rgb2hex(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
  }

  function hex(x) {
    return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
  }

  var lights = document.querySelector(".led-lights");
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      var led = document.createElement("div");
      if (i == 0 && j == 0) {
        led.classList.add('selected');
        led.style.boxShadow = "0px 0px 15px 2px #888";
      }
      led.classList.add('led-light');
      led.setAttribute('key', 4 * i + j);
      led.style.backgroundColor = "#888";
      led.addEventListener('click', (el) => {
        var previous = document.querySelector(".selected");
        previous.style.boxShadow = "none";
        previous.classList.remove("selected");
        el.target.classList.add("selected");
        el.target.style.boxShadow = "0px 0px 15px 2px " + el.target.style.backgroundColor;
        ignoreGlobal = true;
        cp.setHex(rgb2hex(el.target.style.backgroundColor));
      });
      lights.appendChild(led);
    }
    lights.appendChild(document.createElement("br"));
  }

  var clearButton = document.getElementById("clear");
  clearButton.onclick = function() {
    while (output.firstChild) {
      output.removeChild(output.firstChild);
    }
  };

  document.querySelectorAll(".app-choice").forEach(function(el) {
    el.addEventListener("click", function(e) {
      var key = e.target.getAttribute("key");
      document.querySelector("." + key + "-container").classList.add("active");
      document.querySelector(".app-picker-container").style.display = "none";
      backButton.style.display = "block";
    });
  });
}

var ignoreGlobal = true;

function connect(port, baudrate) {
  var baud = 9600;
  if (baudrate) {
    baud = baudrate;
  }

  sp = new SerialPort(port, {
    baudrate: baud,
    buffersize: 1
  }, true);


  sp.on("open", function() {
    window.resizeTo(600, 900);

    // Update button
    var connectedButton = document.querySelector(".connected-button");
    var connectedStatus = document.querySelector(".connected-status");
    connectedButton.classList.remove("disconnected");
    connectedStatus.innerHTML = "Connected";

    document.getElementById("connected-container").style.display = "flex";
    if (!document.querySelector(".app-container.active")) {
      document.querySelector(".app-picker-container").style.display = "flex";
    }
    append("Connection open");
  });

  sp.on("close", function(string) {
    append("Connection closed");
    window.resizeTo(360, 576);
    document.getElementById("connected-container").style.display = "none";
    var activeApp = document.querySelector(".active.app-container");
    var connectedButton = document.querySelector(".connected-button");
    connectedButton.classList.add("disconnected");
    if (activeApp) activeApp.classList.remove("active");
  });

  sp.on("error", function(string) {
    append("Error: " + string, "#EEE", "#dc6969");
  });

  var resistanceEl = document.querySelector(".resistance-value");
  var stretchEl = document.querySelector(".stretch-tracker");
  var minCalibrationEl = document.querySelector(".min-calibration");
  var calibrationEl = document.querySelector(".calibration");
  var buildData = "";
  sp.on("data", function(data) {
    var str = buildData + data.toString();
    if (str[str.length-1] == "\n" || str.last == "\r") {
      buildData = "";
    } else {
      buildData = str;
      return;
    }

    var parts = str.trim().split("|");
    if (parts[0] === "RES") {
      var resistance = parts[1];
      var val = 1000 * parseInt(resistance);
      if (val >= 10000) {
        resistance = "" + Math.floor(val / 1000) + "K";
      } else {
        resistance = "" + val;
      }
      resistance += " Ohms";
      resistanceEl.innerHTML = resistance;
      var minResistance = parseFloat(minCalibrationEl.value);
      var widthRatio = 1.0 - ((val * 1.0 - minResistance) / (parseFloat(calibrationEl.value) - minResistance));
      var percent = Math.max(1, Math.floor(100 * Math.min(1.0, widthRatio)));
      var percentStr = "" + percent + "%";
      stretchEl.style.width = percentStr;
    }
    append(str, "#EEE", "#555");
  });

  var input = document.getElementById("input");
  var sendButton = document.getElementById("send");
  sendButton.onclick = function(e) { send(); };
  input.onkeypress = function(e) {
    if (e.which == 13) {
      send();
    }
  };

}
