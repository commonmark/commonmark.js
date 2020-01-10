SPEC=test/spec.txt
SPECVERSION=$(shell perl -ne 'print $$1 if /^version: *([0-9.]+)/' $(SPEC))
BENCHINP?=bench/samples/README.md
VERSION?=$(SPECVERSION)
JSMODULES=$(wildcard lib/*.js)
UGLIFYJS=node_modules/.bin/uglifyjs

.PHONY: dingus dist test bench bench-detailed npm lint clean update-spec

lint:
	npm run lint

dist: dist/commonmark.js dist/commonmark.min.js

dist/commonmark.js: lib/index.js ${JSMODULES}
	echo '/* commonmark $(VERSION) https://github.com/CommonMark/commonmark.js @license BSD3 */' > $@
	npm run build >> $@

dist/commonmark.min.js: dist/commonmark.js
	$(UGLIFYJS) --version  # version should be at least 2.5.0
	$(UGLIFYJS) $< --compress keep_fargs=true,pure_getters=true --comments > $@

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
