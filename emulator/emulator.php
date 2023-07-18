<html>
	<body>
		<style>
			body, table, td {
				font-size: 1rem;
				font-family: Arial, Helvetica, sans-serif;
			}

			#context-menu {
				border: 1px solid gray;
				box-shadow: 0px 5px 10px -5px black;
				background: white;
				position: absolute;
				text-align: left;
				list-style: none;
				padding: 0;
			}

			#context-menu .menu_item {
				padding: 5px 10px;
			}

			#context-menu .active:hover {
				background: lightgray;
			}
			
		</style>
		<canvas id="canvas" tabindex="1" style="width:100%;height:100%;cursor: default;outline: none;"></canvas>
		<div id="waflashStatus" style="display:none;"></div>
		<ul id="context-menu" style="display:none">
			<li id="menu1" class="menu_item active" style="white-space:nowrap">Enter fullscreen (Emulator 2)</li>
		</ul>
		<script>
			const golddate = Date;
			Date.now = function() {
				const a = new golddate();
				a.setFullYear('2020');
				a.setMonth('11');
				a.setDate('10');
				return a.getTime();
			}
		</script>
		<script type="module">
			import Module from 'https://clubpenguinadvanced.github.io/waflash-demo/emulator2/waflash_latest/waflash.js?t=1';
			const WAFLASH_BASE_URL = "https://clubpenguinadvanced.github.io/waflash-demo/emulator2/waflash_latest/";
			let loaded = false;

			function _getid(id) {
				return document.getElementById(id);
			}

			function init() {
				const waflash = {
					locateFile(path) {
						return WAFLASH_BASE_URL + path;
					},
					canvas: _getid("canvas"),
					statusElement: _getid('waflashStatus'),
				};

				// Keyboard control
				_getid('canvas').addEventListener("keydown", ev => {
					ev.preventDefault();
					ev.stopPropagation();
				});
				
				// Mouse control
				_getid('canvas').addEventListener("mousedown", ev => {
					if (ev.button == 0) {
						_getid('context-menu').style.display = 'none';
					}
				});

				// Open menu event
				function contextmenu_event(ev) {
					ev.preventDefault();
					ev.stopPropagation();
					if (loaded) {
						const a = _getid('context-menu');
						const b = _getid('canvas');
						a.style.display = 'block';
						const x = ev.pageX || ev.clientX;
						const y = ev.pageY || ev.clientY;
						if (x + a.offsetWidth > b.offsetWidth) x = b.offsetWidth - a.offsetWidth;
						if (y + a.offsetHeight > b.offsetHeight) y = b.offsetHeight - a.offsetHeight;
						a.style.left = x + 'px';
						a.style.top = y + 'px';
					}
				}
				_getid('canvas').addEventListener("contextmenu", contextmenu_event);
				_getid('context-menu').addEventListener("contextmenu", contextmenu_event);
				_getid('menu1').addEventListener("contextmenu", contextmenu_event);

			function proc_resize() {
				if (typeof(Event) === 'function') {
					window.dispatchEvent(new Event('resize'));
				} else {
					const evt = window.document.createEvent('UIEvents');
					evt.initUIEvent('resize', true, false, window, 0);
					window.dispatchEvent(evt);
				}
			}

			// Handle fullscreen enter and exit resize
			function exitHandler() {
				const a = _getid('canvas');
				const b = _getid('menu1');
				if (isfullscreen()) {
					b.innerHTML = 'Exit fullscreen (Emulator 2)';
				} else {
					b.innerHTML = 'Enter fullscreen (Emulator 2)';
					a.style.width = '100%';
					a.style.height = '100%';
				}
				setTimeout(function() {
					proc_resize();
				}, 100);
				a.focus();
			}
			document.addEventListener('webkitfullscreenchange', exitHandler, false);
			document.addEventListener('mozfullscreenchange', exitHandler, false);
			document.addEventListener('fullscreenchange', exitHandler, false);
			document.addEventListener('MSFullscreenChange', exitHandler, false);

			function isfullscreen() {
				const isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
					(document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
					(document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
					(document.msFullscreenElement && document.msFullscreenElement !== null);
				return isInFullScreen;
			}

			function proc_fullscreen() {
				if (!isfullscreen() && screen.width > 0 && screen.height > 0) {
					const a = _getid('canvas');
					a.style.width = screen.width + 'px';
					a.style.height = screen.height + 'px';
					setTimeout(function() {
						proc_resize();
						setTimeout(function() {
							proc_fullscreen2();
						}, 100);
					}, 100);
				} else {
					proc_fullscreen2();
				}
			}

			function proc_fullscreen2() {
				try {
					const elem = document.documentElement;
					if (!isfullscreen()) {
						if (elem.requestFullscreen) {
							elem.requestFullscreen();
						} else if (elem.mozRequestFullScreen) {
							elem.mozRequestFullScreen();
						} else if (elem.webkitRequestFullscreen) {
							elem.webkitRequestFullscreen();
						} else if (elem.msRequestFullscreen) {
							elem.msRequestFullscreen();
						}
					} else {
						if (document.exitFullscreen) {
							document.exitFullscreen();
						} else if (document.webkitExitFullscreen) {
							document.webkitExitFullscreen();
						} else if (document.mozCancelFullScreen) {
							document.mozCancelFullScreen();
						} else if (document.msExitFullscreen) {
							document.msExitFullscreen();
						}
					}
				} catch (err) {
					alert(err + '');
				}
			}

			// Load emulator
			Module(waflash).then(o => {
					loaded = true;
					_getid('menu1').onclick = function() {
						proc_fullscreen();
						_getid('context-menu').style.display = 'none';
					}
					loadswf(waflash);
				});
			}
			
			function loadswf(waflash) {
				if (!(parent && parent.gbloburl)) return;
				const xhr = new XMLHttpRequest();
				xhr.open('GET', parent.gbloburl);
				xhr.responseType = 'arraybuffer';
				xhr.onload = function() {
					if (this.status == 200) {
						const uint8Array = new Uint8Array(this.response);
						const buf = waflash._malloc(uint8Array.length);
						waflash.HEAP8.set(uint8Array, buf);
						const res = waflash.ccall('reopenBuffer', 'int', ['string', 'number', 'number'], ['input.swf', buf, uint8Array.length]);
						waflash._free(buf);
						if (res == 0) {
							waflash.setStatus('Error. Failed to load file data.');
						}
					} else {
						waflash.setStatus('Error. Cannot get file data.');
					}
				};
				xhr.onerror = function() {
					waflash.setStatus('Error. Cannot get file data.');
				};
				xhr.send();
			}
			init();
		</script>
	</body>
</html>