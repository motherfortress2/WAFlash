let script2

function handleFileSelect(files) {
  if (!files || files.length == 0 || !files[0]) return
  const reader = new FileReader()
  reader.onload = e => {
    const blob = new Blob([e.target.result])
    blobUrl = window.URL.createObjectURL(blob)
    proc_loadgame(blobUrl)
  }
  reader.onerror = function () {
    alert("Cannot read file: " + this.name)
  }
  reader.readAsArrayBuffer(files[0])
}

function init2() {
  const fileloader = _getid("fileload1")
  fileloader.setAttribute("accept", ".swf")
  fileloader.onchange = e => handleFileSelect(e.target.files)
}

async function proc_loadscript(scriptSrc) {
  const response = await fetch(scriptSrc)
  if (!response) alert("Error. Cannot load emulator scripts.")
  script2 = await response.text()
}

async function proc_loadgame(url) {
  if (!window.WebAssembly) {
    alert('Flash Emulator not supported. Please upgrade your browser.')
    return
  }

  if (!script2) await proc_loadscript("emulator/emulator.php")

  gbloburl = url

  emulator = _getid("emulator2")
  const emulatorIframe = _getfrmdoc(emulator) 
  
  emulator.onload = function () {
    emulator.onload = null
    emulatorIframe.document.open()
    emulatorIframe.document.write(script2)
    emulatorIframe.document.close()
  }
  emulatorIframe.location.replace("about:blank")
}

proc_loadgame("../swf/flyguy.swf")