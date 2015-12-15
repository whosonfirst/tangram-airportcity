var zoom_min = 3;
var zoom_max = 18;

var start_hex = 'ffffff';
var end_hex = '395167';

var start_r = parseInt(start_hex.substring(0, 2), 16);
var start_g = parseInt(start_hex.substring(2, 4), 16);
var start_b = parseInt(start_hex.substring(4, 6), 16);

var end_r = parseInt(end_hex.substring(0, 2), 16);
var end_g = parseInt(end_hex.substring(2, 4), 16);
var end_b = parseInt(end_hex.substring(4, 6), 16);

function airport_onzoom(){

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
}
