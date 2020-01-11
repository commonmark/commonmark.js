// rollup.config.js
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { uglify } from "rollup-plugin-uglify";

export default {
    input: "lib/index.js",
    output: [
      {
        file: "dist/commonmark.js",
        format: "umd",
        name: "commonmark"
      },
      {
        file: "dist/commonmark.min.js",
        format: "umd",
        name: "commonmark",
        plugins: [uglify()]
      }
    ],
    plugins: [nodeResolve(), commonjs(), json()]
};
