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
  window.onbeforeunload = function () {
    for (var i = 0; i < g_lastdata.length; i++) {
      if (g_lastdata[i].url)
        window.URL.revokeObjectURL(g_lastdata[i].url)
    }
  }
}

var g_lastdata2, script2, gbloburl
var g_lastdata = []
function proc_loadscript(src, callback_ok, callback_err) {
  fetch(src)
    .then(async(response) => {
      script2 = await response.text()
      callback_ok()
    })
    .catch((err) => {
      callback_err()
    })
}

function proc_loadgame(url, resp, ishistory) {
  if (!window.WebAssembly) {
    alert('Flash Emulator not supported. Please upgrade your browser.')
    return
  }

  if (!script2) {
    proc_loadscript(
      "emulator/emulator.php",
      () => proc_loadgame(url, resp, ishistory),
      () => alert("Error. Can not download a emulator scripts.")
    )
    return
  }

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
  
  gbloburl = url

  var c = _getid("emulator2")
  if (!c) {
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
      ifrm.document.write(script2)
      ifrm.document.close()
    }
    ifrm.location.replace("about:blank")
  }
}

var okflash = null

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