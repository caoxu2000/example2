## Install new package

Please install npm package with exact version to minimize conflict on package-lock.json

```bash
npm install {package@version} -E
```

example:

```bash
npm install jest@28.1.0 -E
```

## Install packages after pull from Gitlab

To install packages on dependencies section only in `package.json`

```bash
npm install --production
```

To install packages on both dependencies and devDependencies in `package.json`

```bash
npm install
```

Note:

- devDpendencies section is for packages that we install for non-formal testing, ie: unit test, linter
- dependencies section is for packages that we needed for formal testing

## ESlint and Prettier config files

ESlint and Prettier config files both located under project root. `.eslintrc.js` and `.prettierrc.js`

To format code with prettier in VSCode, you could select the code blocks you want to format, and use keyboard shortcut, `Alt + Shift + F`, or update settings for `Editor: Format On Save`
