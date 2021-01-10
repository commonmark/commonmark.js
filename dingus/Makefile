ALL=commonmark.js
COMPONENTS=lodash.min.js jquery.min.js jquery.min.map bootstrap.min.js bootstrap.min.css
LIBFILES=../lib/blocks.js ../lib/common.js ../lib/from-code-point.js ../lib/inlines.js ../lib/index.js ../lib/node.js ../lib/render/xml.js ../lib/render/html.js ../lib/render/renderer.js
BOWER=../node_modules/.bin/bower
HTTPSERVER=../node_modules/.bin/http-server

all: $(ALL) components

.PHONY: all dingus components clean

components: $(COMPONENTS)

bower_components/%:
	$(BOWER) install $(notdir $@)

lodash.min.js: bower_components/lodash
	cp $</dist/lodash.min.js $@

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
	make -C .. test ;\
	cp ../dist/commonmark.js commonmark.js

dingus: all
	echo "Starting dingus server at http://localhost:9000/"; \
	$(HTTPSERVER) -p 9000
