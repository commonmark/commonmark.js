SPEC=test/spec.txt
SPECVERSION=$(shell perl -ne 'print $$1 if /^version: *([0-9.]+)/' $(SPEC))
BENCHINP?=bench/samples/README.md
JSMODULES=$(wildcard lib/*.js)
VERSION?=$(SPECVERSION)
ESLINT=node_modules/.bin/eslint
UGLIFYJS=node_modules/.bin/uglifyjs
BROWSERIFY=node_modules/.bin/browserify

.PHONY: dingus dist test bench bench-detailed npm lint clean update-spec

lint:
	$(ESLINT) -c eslint.json ${JSMODULES} bin/commonmark test/test.js dingus/dingus.js

dist: dist/commonmark.js dist/commonmark.min.js

dist/commonmark.js: lib/index.js ${JSMODULES}
	$(BROWSERIFY) --standalone commonmark $< -o $@

dist/commonmark.min.js: dist/commonmark.js
	$(UGLIFYJS) --version  # version should be at least 2.5.0
	$(UGLIFYJS) $< --compress keep_fargs=true,pure_getters=true --preamble "/* commonmark $(VERSION) https://github.com/jgm/CommonMark @license BSD3 */" > $@

update-spec:
	curl 'https://raw.githubusercontent.com/jgm/CommonMark/master/spec.txt' > $(SPEC)

test: $(SPEC)
	node test/test.js

bench:
	node bench/bench.js ${BENCHINP}

bench-detailed:
	sudo renice -10 $$$$; \
	for x in bench/samples/*.md; do echo $$x; node bench/bench.js $$x; done | \
	awk -f bench/format_benchmarks.awk

npm:
	cd js; npm publish

dingus:
	make -C dingus dingus

clean:
