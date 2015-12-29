var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.airportcity = (function(){

		var zoom_min = 3;
		var zoom_max = 16;
		
		var start_hex = 'ffffff';
		var end_hex = '395167';
		
		var start_r = parseInt(start_hex.substring(0, 2), 16);
		var start_g = parseInt(start_hex.substring(2, 4), 16);
		var start_b = parseInt(start_hex.substring(4, 6), 16);
		
		var end_r = parseInt(end_hex.substring(0, 2), 16);
		var end_g = parseInt(end_hex.substring(2, 4), 16);
		var end_b = parseInt(end_hex.substring(4, 6), 16);
		
		var map;

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
				
				var layer = Tangram.leafletLayer({
						scene: 'tangram/airportcity.yaml',
						numWorkers: 2,
						unloadInvisibleTiles: false,
						updateWhenIdle: false,
						attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
					});
				
				layer.addTo(map);
				
				map.setView([40.6856, -74.1654], 13);
				map.on('zoomend', self.onzoom);
				
				self.onzoom();
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

					// PLEASE TO BE ERROR REPORTING

					if (! count){
						return;
					}

					var first = rsp[0];
					var lat = first['Latitude'];
					var lon = first['Longitude'];

					map.setView([lat, lon], 13);					
				};

				// PLEASE TO BE ERROR REPORTING

				var on_fail = function(rsp){
					console.log(rsp);
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
			}

		};
		
		return self;
		
	})();