var script2, gbloburl

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
  var fileloader = _getid("fileload1")
  fileloader.setAttribute("accept", ".swf")
  fileloader.onchange = e => {
    if (!e || !e.target) {
      alert("Cannot load file.")
      return
    }
    handleFileSelect(e.target.files)
  }
}

function proc_loadscript(scriptSrc, fileUrl) {
  fetch(scriptSrc)
  .then(async(response) => {
    script2 = await response.text()
    proc_loadgame(fileUrl)
  })
  .catch(e => alert("Error. Cannot load emulator scripts."))
}

function proc_loadgame(url) {
  if (!window.WebAssembly) {
    alert('Flash Emulator not supported. Please upgrade your browser.')
    return
  }

  if (!script2) {
    proc_loadscript("emulator/emulator.php", url)
    return
  }

  gbloburl = url

  var emulator = _getid("emulator2")
  var emulatorIframe = _getfrmdoc(emulator) 
  
  emulator.onload = function () {
    emulator.onload = null
    emulatorIframe.document.open()
    emulatorIframe.document.write(script2)
    emulatorIframe.document.close()
  }
  emulatorIframe.location.replace("about:blank")
}

init2()