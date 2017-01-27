# webpack-webext-plugin

a small Webpack plugin to integrate web-ext commands into a web-pack build.

## Installation
`npm i -D rpl/webpack-webext-plugin`

_In webpack.config.js_
```javascript
const WebpackWebExt = require('webpack-webext-plugin');

let config = {
    // <...>

    plugins: [
      new WebpackWebExt({
        runOnce: false,
        argv: ["lint", "-s", "extension/"],
      }),

      new WebpackWebExt({
        runOnce: true,
        maxRetries: 3,
        argv: ["run", "-s", "extension/"],
      })
    ]
};

module.exports = config;
```

## Usage
`webpack -w`
