// rollup.config.js
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
    input: "lib/index.js",
    output: {
        file: "dist/commonmark.js",
        format: "umd",
        name: "commonmark"
    },
    plugins: [nodeResolve(), commonjs(), json()]
};
