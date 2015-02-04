APP=dingus
ALL=$(APP)/index.html $(APP)/index.css $(APP)/commonmark.js $(APP)/index.js

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

$(APP)/index.css: index.styl $(APP)
	stylus -u autoprefixer-stylus < $< > $@

$(APP)/index.js: index.js
	cp $< $@

sample.json: sample.md
	node demodata.js > $@

demo:
	python -m SimpleHTTPServer
