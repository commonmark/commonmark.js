ALL=commonmark.js
COMPONENTS=lodash.min.js jquery.min.js jquery.min.map bootstrap.min.js bootstrap.min.css ace.js

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

ace.js:
	curl 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.1.3/ace.js' > $@

clean:
	-rm $(ALL) $(COMPONENTS)
	rm -r bower_components

commonmark.js: ../lib/index.js
	browserify --standalone commonmark $< -o $@

dingus: all
	echo "Starting dingus server at http://localhost:9000/"; \
	http-server -p 9000 || python -m SimpleHTTPServer 9000
