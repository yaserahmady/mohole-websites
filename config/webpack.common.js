const path = require("path");

module.exports = {
  entry: {
    main: "./src/js/main.js",
  },
  output: {
    path: path.resolve(__dirname, "../dist/"),
    filename: "[name].js",
  },
};
