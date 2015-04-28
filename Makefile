SPEC=test/spec.txt
SPECVERSION=$(shell perl -ne 'print $$1 if /^version: *([0-9.]+)/' $(SPEC))
BENCHINP?=bench/samples/README.md
JSMODULES=$(wildcard lib/*.js)
VERSION?=$(SPECVERSION)

.PHONY: dingus dist test bench bench-detailed npm lint clean update-spec

lint:
	eslint -c eslint.json ${JSMODULES} bin/commonmark test/test.js dingus/dingus.js

dist: dist/commonmark.js dist/commonmark.min.js

dist/commonmark.js: lib/index.js ${JSMODULES}
	browserify --standalone commonmark $< -o $@

# 'npm install -g uglify-js' for the uglifyjs tool:
dist/commonmark.min.js: dist/commonmark.js
	uglifyjs $< --compress keep_fargs=true,pure_getters=true --preamble "/* commonmark $(VERSION) https://github.com/jgm/CommonMark @license BSD3 */" > $@

update-spec:
	curl 'https://raw.githubusercontent.com/jgm/CommonMark/master/spec.txt' > $(SPEC)

test: $(SPEC)
	node test/test.js

bench:
	sudo renice 99 $$$$; node bench/bench.js ${BENCHINP}

bench-detailed:
	sudo renice 99 $$$$; \
	for x in bench/samples/*.md; do echo $$x; node bench/bench.js $$x; done | \
	awk -f bench/format_benchmarks.awk

npm:
	cd js; npm publish

dingus:
	make -C dingus dingus

clean:
