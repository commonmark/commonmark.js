#!/bin/sh env awk
BEGIN {
    CONVFMT="%2.1f";
    print "| Sample                   |showdown  |commonmark|marked    |markdown-it|"
    print "|--------------------------|---------:|---------:|---------:|----------:|"
}
{
        if (/^bench\/samples\//) {
                sub(/bench\/samples\//, "");
                printf "|%-26s|", "[" $0 "]";
                samples[$0] = "bench/samples/" $0;
        } else if (/^showdown/) {
                sub(/,/, "");
                showdown = $3;
        } else if (/^commonmark/) {
                sub(/,/, "");
                commonmark = $3;
        } else if (/^marked/) {
                sub(/,/, "");
                marked = $3;
        } else if (/^markdown-it/) {
                sub(/,/, "");
                markdownit = $3;
                printf "%10s|%10s|%10s|%11s|\n",
                       (showdown / showdown),
                       (commonmark / showdown),
                       (marked / showdown),
                       (markdownit / showdown);
                markdownit = "";
                showdown = "";
                marked = "";
                commonmark = "";
        } else {
                next;
        }
}
END {
    printf "\n";
    for (sample in samples) {
        printf "[%s]: %s\n", sample, samples[sample];
    }
}
