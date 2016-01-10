Release checklist

_ update changelog.txt
_ update version in package.json
_ update version in lib/index.js
_ make dist
_ test
_ tag release
_ git push
_ git push --tags
_ npm publish
_ create github release
_ for releases involving a spec change: update dingus:

    cd dingus
    make
    cd ../../CommonMark-site
    make update
    make
    make upload

_ update babelmark2: copy commonmark.js to src/babelmark2/js on server
