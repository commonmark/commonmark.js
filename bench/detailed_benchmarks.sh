sudo echo ""
for x in bench/samples/*.md; do make bench BENCHINP=$x; done | awk -f bench/format_benchmarks.awk
