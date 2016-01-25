tangram:
	if test -e www/javascript/tangram.js; then cp www/javascript/tangram.js.bak; fi
	curl -s -o www/javascript/tangram.js https://mapzen.com/tangram/tangram.js
	if test -e www/javascript/tangram.min.js; then cp www/javascript/tangram.min.js.bak; fi
	curl -s -o www/javascript/tangram.min.js https://mapzen.com/tangram/tangram.min.js