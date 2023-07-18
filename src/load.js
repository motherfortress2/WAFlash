function handleFileSelect(files) {
  if (!files || files.length == 0 || !files[0]) return
  var reader = new FileReader()
  reader.onload = e => {
    var blob = new Blob([e.target.result])
    blobUrl = window.URL.createObjectURL(blob)
    proc_loadgame(blobUrl)
  }
  reader.onerror = function () {
    alert("Cannot read file: " + this.name)
  }
  reader.readAsArrayBuffer(files[0])
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

function proc_loadgame(url) {
  if (!window.WebAssembly) {
    alert('Flash Emulator not supported. Please upgrade your browser.')
    return
  }

  if (!script2) {
    proc_loadscript(
      "emulator/emulator.php",
      () => proc_loadgame(url),
      () => alert("Error. Can not download a emulator scripts.")
    )
    return
  }

  var w = 1000
  var h = 900
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

init2()