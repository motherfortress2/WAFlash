function proc_sample(filename) {
  var resp = {}
  resp.id = "(Sample) " + filename
  resp.title = resp.id
  resp.downloadUrl =
    "https://thumbsdb.herokuapp.com/flashplayer/sample/" + filename
  resp.issample = true
  gd_loadfile("", resp)
}

var gfiles
var gmaxsize = 60
function handleFileSelect(files) {
  if (!window.FileReader || !window.XMLHttpRequest) {
    alert("This browser does not support.")
    return
  }

  if (files) gfiles = files
  if (!gfiles || gfiles.length == 0) return

  var tot = 0
  for (var i = 0, f; (f = gfiles[i]); i++) {
    var usearray = false
    var f = gfiles[i]
    if (f.size > gmaxsize * 1024 * 1024) {
      alert(
        "The file size is too large to view. (around " +
          gmaxsize +
          " MB limit)"
      )
      return
    }
    var reader = new FileReader()
    reader.onload = function (e) {
      var blob = new Blob([e.target.result])
      gd_bloburl = window.URL.createObjectURL(blob)
      var resp = {}
      resp.id = "(Local) " + this.name
      resp.title = resp.id
      proc_loadgame(gd_bloburl, resp)
    }
    reader.onerror = function () {
      alert("Read Error: " + this.name)
    }
    reader.id = i
    reader.name = f.name
    if (!reader.readAsArrayBuffer) {
      alert("This browser does not support.")
      return
    } else {
      reader.readAsArrayBuffer(f)
    }
    break
  }
}
function init2() {
  _getid("fileload1").onchange = function (e) {
    if (!e || !e.target) {
      alert("This browser does not support.")
      return
    }
    handleFileSelect(e.target.files)
  }
  var holder = document
  holder.ondragover = function (e) {
    try {
      var ua = navigator.userAgent
      if (ua && ua.indexOf("Chrome") >= 0) {
        if (e.originalEvent) e = e.originalEvent
        if (e.dataTransfer) {
          var b = e.dataTransfer.effectAllowed
          e.dataTransfer.dropEffect =
            "move" === b || "linkMove" === b ? "move" : "copy"
        }
      }
    } catch (err) {}
    return false
  }
  holder.ondragend = function () {
    return false
  }
  holder.ondrop = function (e) {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files)
    return false
  }
  if (
    navigator.userAgent &&
    navigator.userAgent.toLowerCase().indexOf("windows") >= 0
  ) {
    var a = _getid("fileload1")
    a.setAttribute("accept", ".swf")
  }
  var s = 100
  if (!isNaN(s)) {
    if (s < 0) s = 0
    if (s > 100) s = 100
  }
  sel_emulator_onchange()
  window.onbeforeunload = function () {
    for (var i = 0; i < g_lastdata.length; i++) {
      if (g_lastdata[i].url)
        window.URL.revokeObjectURL(g_lastdata[i].url)
    }
  }
}

function sel_emulator_onchange() {
  setstorage("sel_emulator", "emu2")
}
function volume1_onchange() {
  try {
    setstorage("volume1", _getid("volume1").value)
    var v = parseInt(_getid("volume1").value) / 100
    var a = _getid("emulator2")
    if (a) {
      var ifrm = _getfrmdoc(a)
      if (ifrm && ifrm.proc_volume) ifrm.proc_volume(v)
    }
  } catch (err) {}
}
function size_width_onchange(f, nosize) {
  var w = _getid("size_width").value
  var h = _getid("size_height").value
  if (w < 100) w = 100
  if (w > 1000) w = 1000
  if (h < 100) h = 100
  if (h > 900) h = 900
  if (f) {
    _getid("size_width_n").value = w
    _getid("size_height_n").value = h
  }
  function find(parent) {
    var a = parent.getElementsByTagName("*")
    for (var i = 0; i < a.length; i++) {
      var s = a[i].tagName
      if (s == "IFRAME" || s == "EMBED" || s == "OBJECT") {
        if (s == "OBJECT") find(a[i])
        a[i].width = w
        a[i].height = h
      }
    }
  }
  if (!nosize) find(_getid("codearea"))
}
function size_width_n_onchange(f) {
  var w = _getid("size_width_n").value
  var h = _getid("size_height_n").value
  if (w < 100) w = 100
  if (w > 1000) w = 1000
  if (h < 100) h = 100
  if (h > 900) h = 900
  _getid("size_width").value = w
  _getid("size_height").value = h
  size_width_onchange()
}

function vphistory_onchange(f) {
  if (!f.value) return
  for (var i = 0; i < g_lastdata.length; i++) {
    if (g_lastdata[i].id == f.value) {
      proc_loadgame(g_lastdata[i].url, g_lastdata[i].resp, true)
      break
    }
  }
}
function set_flashvars() {
  var f = _getid("sel_vphistory")
  if (!f || !f.value) return
  for (var i = 0; i < g_lastdata.length; i++) {
    if (g_lastdata[i].id == f.value) {
      var s1 = g_lastdata[i].resp.flashvars || ""
      while (true) {
        s = prompt(
          "Please enter a flashvars value to apply.\nex) aaa=1&bbb=2&ccc=3",
          s1
        )
        if (s == null) return
        if (!s) s = ""
        if (s.indexOf('"') >= 0) {
          s1 = s
          alert('Double Quotation(") character is not allowed.')
        } else {
          break
        }
      }
      g_lastdata[i].resp.flashvars = s
      alert(
        'It has changed the flashvars value. Click the "Refresh" button above to apply to the current flash.'
      )
      break
    }
  }
}

var g_lastdata2, script2, gbloburl
var g_lastdata = []
function proc_loadscript(src, callback_ok, callback_err) {
  fetch(src)
    .then(async (response) => {
      script2 = await response.text()
      callback_ok()
    })
    .catch((err) => {
      callback_err()
    })
}
function proc_loadgame(url, resp, ishistory) {
  var sel_emulator = "emu2"
  if (window.WebAssembly && sel_emulator == "emu2" && !script2) {
    proc_loadscript(
      "emulator/emulator.php",
      function () {
        proc_loadgame(url, resp, ishistory)
      },
      function () {
        alert("Error. Can not download a emulator scripts.")
      }
    )
    return
  }

  g_lastdata2 = {}
  g_lastdata2.url = url
  g_lastdata2.resp = resp

  var w = 1000
  var h = 900
  var a = get_data()
  for (var i = 0; i <= a.length - 1; i++) {
    if (a[i].id == resp.id) {
      w = a[i].width
      h = a[i].height
      break
    }
  }

  var codearea = _getid("codearea")

  if (sel_emulator == "emu1" || sel_emulator == "emu2") {
    if (!window.WebAssembly) {
      alert(
        'This browser does not support "Play by Flash Emulator". Please upgrade your browser.'
      )
      return
    }
    var s1 = ""
    if (sel_emulator == "emu2") {
      gbloburl = url
      s1 = script2
    } else {
      var s =
        '<embed width="100%" height="100%" src="' +
        url +
        '" quality="high" pluginspage="https://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" allowfullscreen="true" allowScriptAccess="never"'
      if (resp.flashvars && resp.flashvars.indexOf('"') < 0) {
        s += ' flashvars="' + resp.flashvars + '"'
      }
      s += ">"
      s1 =
        "<html><div><style>body,table,td {font-size:14px; font-family: Arial, Helvetica, sans-serif;}</style>"
      s1 +=
        '<table id="loading" style="position:absolute;left:10px;top:20px;background: white;padding:3px;border:0px solid silver;-webkit-box-shadow: 0 0 10px #999;-moz-box-shadow: 0 0 10px #999; box-shadow: 0 0 10px #999;"><tr>'
      s1 +=
        '<td><img src="https://clubpenguinadvanced.github.io/etc/wait.gif">'
      s1 += "<td>Loading library... Please wait a moment.</table>"
      s1 += s
      s1 += _getid("script1").value
      s1 += "</div></html>"
    }

    var c = _getid("emulator2")
    if (!c) {
      codearea.innerHTML =
        '<iframe id="emulator2" width="' +
        w +
        '" height="' +
        h +
        '" frameborder="0" marginwidth="0" marginheight="0" scrolling="NO" allow="autoplay; fullscreen"></iframe>'
      c = _getid("emulator2")
      if (!c) return
    } else {
      c.width = w
      c.height = h
    }
    var ifrm = _getfrmdoc(c)
    if (ifrm) {
      c.onload = function () {
        c.onload = null
        ifrm.document.open()
        ifrm.document.write(s1)
        ifrm.document.close()
      }
      ifrm.location.replace("about:blank")
    }
  } else {
    //check_flash();
    var s = ""
    if (!okflash)
      s +=
        '<div style="margin-bottom:5px"><font style="color:green">Adobe Flash Player is required. Check the flash player is installed.<br>or Select the "Flash Emulator" above (latest browsers) and Click the Refresh button above.</font></div>'
    s +=
      '<embed width="' +
      w +
      '" height="' +
      h +
      '" src="' +
      url +
      '" quality="high" pluginspage="https://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" allowfullscreen="true" allowScriptAccess="never"'
    if (resp.flashvars && resp.flashvars.indexOf('"') < 0) {
      s += ' flashvars="' + resp.flashvars + '"'
    }
    s += ">"
    //s='<iframe width="'+w+'" height="'+h+'" src="'+url+'"></iframe>';
    codearea.innerHTML = s
  }
  codearea.data = resp.id
}

var okflash = null
function check_flash() {
  if (okflash != null) return
  okflash = false
  try {
    if (new ActiveXObject("ShockwaveFlash.ShockwaveFlash"))
      okflash = true
  } catch (e) {
    var a = navigator.mimeTypes
    if (
      a &&
      a["application/x-shockwave-flash"] != undefined &&
      a["application/x-shockwave-flash"].enabledPlugin
    )
      okflash = true
  }
}
function get_data() {
  var s = getstorage("drive_data")
  if (!s) s = "[]"
  var a = []
  try {
    a = JSON.parse(s)
  } catch (err) {
    a = []
  }
  if (!a) a = []
  return a
}
init2()