 Converting to qualified action names
========================

With the introduced requirement that action names have to be of the form
`[qualifier] action name`, it might be useful to automate this change.

In Ardoq we used this codemod to convert 600 actions. It picks the name of the
file (or folder if the file is called `actions` or `utils`) and uses that as the
qualifier. It can be run with [jscodeshift](https://github.com/facebook/jscodeshift/):

    npx jscodeshift --parser ts --extension ts -t codemod-qualified-actions.js src/js/ardoq


```javascript
function qualified(path, action) {
  const parts = path.split('.')[0].split('/');
  let name = parts[parts.length - 1];
  if (name === 'actions' || name === 'utils') {
    name = parts[parts.length - 2];
  }
  return `[${name}] ${action}`;
}

module.exports = function ({ source, path }, api, options) {
  return api
    .jscodeshift(source)
    .find(api.jscodeshift.CallExpression, {
      callee: {
        type: 'Identifier',
        name: 'actionCreator',
      },
    })
    .filter(n => {
      const arg = n.value.arguments[0];
      return arg && arg.type === 'StringLiteral' && !arg.value.startsWith('[');
    })
    .forEach(n => {
      n.value.arguments[0].value = qualified(path, n.value.arguments[0].value);
    })
    .toSource();
};
```