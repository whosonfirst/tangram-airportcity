tangram:
	if test -e www/javascript/tangram.js; then cp www/javascript/tangram.js www/javascript/tangram.js.bak; fi
	curl -s -o www/javascript/tangram.js https://mapzen.com/tangram/tangram.debug.js
	if test -e www/javascript/tangram.min.js; then cp www/javascript/tangram.min.js www/javascript/tangram.min.js.bak; fi
	curl -s -o www/javascript/tangram.min.js https://mapzen.com/tangram/tangram.min.js

js-deps:
	if test -e www/javascript/airportcity.deps.min.js; then cp www/javascript/airportcity.deps.min.js www/javascript/airportcity.deps.min.js.bak; fi
	cat www/javascript/leaflet.min.js www/javascript/leaflet.hash.min.js www/javascript/FileSaver.min.js > www/javascript/airportcity.deps.min.js

js-app:
	if test -e www/javascript/airportcity.app.min.js; then cp www/javascript/airportcity.app.min.js www/javascript/airportcity.app.min.js.bak; fi
	cat www/javascript/mapzen.whosonfirst.log.js www/javascript/mapzen.whosonfirst.net.js www/javascript/mapzen.whosonfirst.php.js www/javascript/mapzen.whosonfirst.airportcity.js > www/javascript/airportcity.app.js
	java -jar utils/yuicompressor-2.4.8.jar --type js www/javascript/airportcity.app.js -o www/javascript/airportcity.app.min.js
	rm www/javascript/airportcity.app.js

js: js-deps js-app

css-deps:
	if test -e www/css/airportcity.deps.min.css; then cp www/css/airportcity.deps.min.css www/css/airportcity.deps.min.css.bak; fi
	cp www/css/leaflet.min.css www/css/airportcity.deps.min.css

css-app:
	if test -e www/css/airportcity.app.min.css; then cp www/css/airportcity.app.min.css www/css/airportcity.app.min.css.bak; fi
	java -jar utils/yuicompressor-2.4.8.jar --type css www/css/airportcity.css > www/css/airportcity.app.min.css

css: css-deps css-app