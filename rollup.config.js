// rollup.config.js
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { uglify } from "rollup-plugin-uglify";
import { version } from './package.json';

var banner = "/* commonmark " + version + " https://github.com/commonmark/commonmark.js @license BSD3 */";

export default {
    input: "lib/index.js",
    output: [
      {
        file: "dist/commonmark.js",
        format: "umd",
        name: "commonmark",
        banner: banner,
      },
      {
        file: "dist/commonmark.min.js",
        format: "umd",
        name: "commonmark",
        banner: banner,
        plugins: [uglify()]
      }
    ],
    plugins: [nodeResolve(), commonjs(), json()]
};
