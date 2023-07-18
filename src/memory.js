function setstorage(name, value) {
  if (window.localStorage) {
    localStorage[name] = value + ""
  } else {
    setCookie(name, value, 1000*60*60*24*365*10);
  }
}

function getstorage(name) {
  var s
  if (window.localStorage) {
    s = localStorage[name]
  } else {
    s = getCookie(name);
  }
  return s
}