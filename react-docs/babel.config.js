module.exports = {
  presets: [
    ['@babel/preset-env'],
    ['@babel/preset-react'],
    ['@babel/preset-typescript'],
  ],
  plugins: [
    ["import", { "libraryName": "antd", "libraryDirectory": "es", "style": "css" }],
    ["@babel/plugin-transform-regenerator"],
    ["@babel/plugin-transform-runtime"],
    ["@babel/plugin-proposal-nullish-coalescing-operator"],
    ["@babel/plugin-proposal-optional-chaining"],
  ]
}