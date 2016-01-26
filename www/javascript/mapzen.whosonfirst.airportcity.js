var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.airportcity = (function(){

		var zoom_min = 3;
		var zoom_max = 16;
		
		var start_hex = 'ffffff';
		// var end_hex = '395167';	// the original airport city
		var end_hex = '72a0c1';		// air superiority blue

		var start_r = parseInt(start_hex.substring(0, 2), 16);
		var start_g = parseInt(start_hex.substring(2, 4), 16);
		var start_b = parseInt(start_hex.substring(4, 6), 16);
		
		var end_r = parseInt(end_hex.substring(0, 2), 16);
		var end_g = parseInt(end_hex.substring(2, 4), 16);
		var end_b = parseInt(end_hex.substring(4, 6), 16);
		
		var map;
		var layer;
		var fb;

		var endpoint = 'http://localhost:3333';

		var self = {
			
			'init': function(){

				var args = {
					'minZoom': zoom_min, 'maxZoom': zoom_max
				};
		
				// please replace me with mapzen.whosonfirst.tangram
				// (20151216/thisisaaronland)

				map = L.map('map', args);
				L.hash(map);
				
				layer = Tangram.leafletLayer({
						scene: 'tangram/airportcity.yaml',
						numWorkers: 2,
						unloadInvisibleTiles: false,
						updateWhenIdle: false,
						attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
					});
				
				layer.addTo(map);
				
				// TO DO: iplookup hoohah

				map.setView([40.6856, -74.1654], 13);
				map.on('zoomend', self.onzoom);
				
				self.onzoom();

				var c = document.getElementById("feedback-controls");
				c.onclick = self.hide_feedback;

				document.body.onkeydown = self.onkeyboard;
			},

			'onkeyboard': function(event){

				console.log(event);
				var key = event.keyCode || event.which;
				var keychar = String.fromCharCode(key);

				if ((event.shiftKey) && (keychar == "S")){

					if (event.metaKey){
						self.screenshot_as_file();
					}

					else {
						self.screenshot();
					}
				}
			},

			'onzoom': function(){
				
				function interpolate(begin, end, step, max){
					
					if (begin < end) {
						return ((end - begin) * (step / max)) + begin;
					}
					
					return ((begin - end) * (1 - (step / max))) + end;
				}
				
				function hex (c) {
					
					var s = "0123456789abcdef";
					var i = parseInt (c);
					
					if (i == 0 || isNaN (c)){
						return "00";
					}
					
					i = Math.round (Math.min (Math.max (0, i), 255));
					return s.charAt ((i - i % 16) / 16) + s.charAt (i % 16);
				}
				
				var z = null;
				
				// this is here so that we can toggle between
				// polymaps and modestmaps easily (20110306/asc)
				
				try {
					z = map.zoom();
				} catch (x) {
					z = map.getZoom();
				}
				
				var step = Math.ceil((z.toFixed(1) - zoom_min) * 10);
				
				var r = interpolate(start_r, end_r, step, 100);
				var g = interpolate(start_g, end_g, step, 100);
				var b = interpolate(start_b, end_b, step, 100);
				
				bgcolor = hex(r) + hex(g) + hex(b);

				// See notes below (in 'screenshot') about where/what/who
				// should be updating the background colour
				// (20160125/thisisaaronland)

				var m = document.getElementById('map');
				m.style.backgroundColor = '#' + bgcolor;
			},

			'search': function() {

				var q = document.getElementById("search_query");
				q = q.value;

				if (q == ""){
					alert("Silly! You forgot to say what you want to search for");
				}

				query = mapzen.whosonfirst.net.encode_query({ 'q': q });
				url = self.search_endpoint() + "?" + query;

				var on_success = function(rsp){
					
					var count = rsp.length;

					if (count == 0){

						var msg = "sorry, there don't appear to be any results for '" + q + "'";
						mapzen.whosonfirst.airportcity.feedback(msg);

						return;
					}

					else if (count == 1){
						var first = rsp[0];
						var lat = first['Latitude'];
						var lon = first['Longitude'];
						map.setView([lat, lon], 13);
					}

					else {

						var swlat = undefined;
						var swlon = undefined;
						var nelat = undefined;
						var nelon = undefined;

						for (var i=0; i < count; i++){

							var lat = rsp[i]['Latitude'];
							var lon = rsp[i]['Longitude'];

							if ((! swlat) || (lat < swlat)){
								swlat = lat;
							}

							if ((! swlon) || (lon < swlon)){
								swlon = lon;
							}

							if ((! nelat) || (lat > nelat)){
								nelat = lat;
							}

							if ((! nelon) || (lon > nelon)){
								nelon = lon;
							}
						}

						var bounds = [[swlat, swlon], [nelat, nelon]];
						map.fitBounds(bounds);

						var msg = "mutiple results for '" + q + "' so zooming out to fit them all";
						mapzen.whosonfirst.airportcity.feedback(msg);

						// console.log(bounds);
					}
				};

				var on_fail = function(rsp){

					var msg = "oh no... there was a problem doing that search";
					mapzen.whosonfirst.airportcity.feedback(msg);

					// console.log(rsp);
				};

				try {
					mapzen.whosonfirst.net.fetch(url, on_success, on_fail);
				} catch (e) {
					console.log(e);
				}

				return false;
			},

			'search_endpoint' : function(e) {

				if (e){
					endpoint = e;
				}

				return endpoint;
			},

			'toggle_footer' : function(show) {

				var style = (show) ? "display:inline;" : "display:none;";

				var f = document.getElementById("footer");
				f.style = style;

				var a = document.getElementsByClassName("leaflet-control-attribution");
				a[0].style = style;
			},

			'feedback': function(msg) {

				if (fb){
					clearTimeout(fb);
				}

				var m = document.getElementById("feedback-msg");
				m.innerHTML = mapzen.whosonfirst.php.htmlspecialchars(msg);

				var f = document.getElementById("feedback");
				f.style = "display:block;";

				fb = setTimeout(function(){					
						mapzen.whosonfirst.airportcity.hide_feedback();
				}, 5000);
			},

			'hide_feedback': function() {
				var m = document.getElementById("feedback-msg");
				m.innerHTML = "";
						
				var f = document.getElementById("feedback");
				f.style = "display:none;";
			},

			'scene': function(){
				return layer.scene;
			},

			'screenshot_as_file': function(){

				var fname = 'tangram-airportcity-' + (+new Date()) + '.png';

				var callback = function(sh){					
					saveAs(sh.blob, fname);
				};

				self.screenshot(callback);
			},

			'screenshot': function(on_screenshot){

				if (! on_screenshot){

					on_screenshot = function(sh) {
						window.open(sh.url);
					};
				}

				var scene = self.scene();

				var m = document.getElementById("map");
				var c = m.style.backgroundColor;

				if (! scene.config.scene.background){
					scene.config.scene.background = {};
				}

				scene.config.scene.background.color = c;
				scene.updateConfig();

				scene.screenshot().then(function(sh){

					on_screenshot(sh);

					// Remove Tangram background so that the code
					// to set the background colour on the #map div
					// displays. This suggests that perhaps we should
					// be setting 'scene.config.scene.background.color'
					// instead but I don't know what the penalty for
					// invoking 'updateConfig' all the time would be
					// (20160125/thisisaaronland)

					scene.config.scene.background = {};
					scene.updateConfig();
				});
			}
		};
		
		return self;
		
	})();