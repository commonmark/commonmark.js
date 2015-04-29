Release checklist

_ update package.json
_ update changelog.txt
_ make dist
_ test
_ tag release
_ git push
_ git push --tags
_ npm publish
_ create github release
_ update dingus:

    cd dingus
    make
    cd ../../CommonMark-site
    make update
    make upload
