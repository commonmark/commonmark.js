APP=dingus
ALL=$(APP)/index.html $(APP)/index.css sample.json

all: $(ALL)

.PHONY: all

clean:
	-rm -r $(APP)
	-rm sample.json

$(APP):
	mkdir -p $(APP)

$(APP)/index.html: index.jade sample.json $(APP)
	jade $< --pretty --obj sample.json --out $(APP)

$(APP)/index.css: index.styl $(APP)
	stylus -u autoprefixer-stylus < $< > $@

sample.json: sample.md
	node demodata.js > $@
