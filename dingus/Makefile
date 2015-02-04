APP=dingus
ALL=$(APP)/index.html $(APP)/dingus.css $(APP)/commonmark.js $(APP)/dingus.js

all: $(ALL)

.PHONY: all demo clean

clean:
	-rm -r $(APP)
	-rm sample.json

$(APP):
	mkdir -p $(APP)

$(APP)/commonmark.js: ../lib/index.js
	browserify --standalone commonmark $< -o $@

$(APP)/index.html: index.jade sample.json $(APP)
	jade $< --pretty --obj sample.json --out $(APP)

$(APP)/dingus.css: dingus.styl $(APP)
	stylus -u autoprefixer-stylus < $< > $@

$(APP)/dingus.js: dingus.js
	cp $< $@

sample.json: sample.md
	node demodata.js > $@

demo: $(ALL)
	echo "Starting dingus server at http://localhost:9000/"; \
	cd dingus && \
	http-server -p 9000 || python -m SimpleHTTPServer 9000
