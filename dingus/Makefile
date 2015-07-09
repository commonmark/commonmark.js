ALL=commonmark.js
COMPONENTS=lodash.min.js jquery.min.js jquery.min.map bootstrap.min.js bootstrap.min.css
LIBFILES=../lib/blocks.js ../lib/common.js ../lib/from-code-point.js ../lib/html.js ../lib/inlines.js ../lib/index.js ../lib/node.js ../lib/normalize-reference.js ../lib/xml.js

all: $(ALL) components

.PHONY: all dingus components clean

components: $(COMPONENTS)

bower_components/%:
	bower install $(notdir $@)

lodash.min.js: bower_components/lodash
	cp $</lodash.min.js $@

jquery.min.js: bower_components/jquery
	cp $</dist/$@ $@

jquery.min.map: bower_components/jquery
	cp $</dist/$@ $@

bootstrap.min.js: bower_components/bootstrap
	cp $</dist/js/$@ $@

bootstrap.min.css: bower_components/bootstrap
	cp $</dist/css/$@ $@

clean:
	-rm $(ALL) $(COMPONENTS)
	rm -r bower_components

commonmark.js: ../lib/index.js $(LIBFILES)
	browserify --standalone commonmark $< -o $@

dingus: all
	echo "Starting dingus server at http://localhost:9000/"; \
	http-server -p 9000 || python -m SimpleHTTPServer 9000
