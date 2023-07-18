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
      alert("Cannot load file.")
      return
    }
    handleFileSelect(e.target.files)
  }
  document.ondrop = e => handleFileSelect(e.dataTransfer.files)
  var a = _getid("fileload1")
  a.setAttribute("accept", ".swf")
}

var script2, gbloburl
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