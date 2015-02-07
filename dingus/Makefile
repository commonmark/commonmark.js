ALL=commonmark.js

all: $(ALL)

.PHONY: all demo clean

clean:
	-rm $(ALL)

commonmark.js: ../lib/index.js
	browserify --standalone commonmark $< -o $@

dingus: $(ALL)
	echo "Starting dingus server at http://localhost:9000/"; \
	http-server -p 9000 || python -m SimpleHTTPServer 9000
