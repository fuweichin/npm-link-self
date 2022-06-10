# npm-link-self

CLI script to link self to ./node_modules/ thus you may require/import self in scripts or tests, useful for package developers.

<!--ts-->
   * [Background](#background)
      * [Q &amp; A](#q--a)
   * [Install](#install)
   * [Usage](#usage)
      * [Modes](#modes)
   * [License](#license)
<!--te-->

## Background

Assuming you are developing a node project, you may want to require/import/pass self with package name as specifer, rather than a relative specifier (like `./` or `./main.js`), in your tests/examples/scripts source.

### Q & A

Q: Why not just `npm install ./`?

A: Because each time I modify core source code, I don't want to run `npm install ./` again to apply changes for tests/examples/scripts.

Q: Why not just `npm link ./`?

A: Yes, it's the most simple solution if you don't mind recursive direcrtory structure.

Q: Why reinventing the wheel? There are already [install-self](https://github.com/jamesadarich/install-self), [link-self](https://github.com/BTOdell/link-self), [npm-self-link](https://www.npmjs.com/package/npm-self-link) doing similar things.

A: Each of them is trying to solve a problem, but this package is trying to achieve balance between `npm install ./` and `npm link ./`.



## Install

```sh
npm install --global npm-link-self
# or
npm install --save-dev npm-link-self
```



## Usage

```sh
# just link self
npm-link-self

# also create bin links, run hook scripts (very slow)
npm-link-self --install
```



### Modes

**link mode** (default)

1. run `npm pack --dry-run --json ./` to get a list of to-be-packed files
2. for each file in the list, create directories / create symlinks under `node_modules/<self-package-name>`

**install mode** (with CLI arg `--install`)

1. run `mkdir -p node_modules/.cache && npm pack --pack-destination node_modules/.cache`
2. run `npm install --no-save --only=prod --no-optional node_modules/.cache/<pkg-tgz>` to install self
3. for each file under `node_modules/<self-package-name>`, replace the files with symlinks

If you added new file (which will be packed to .tgz), you may need to run "npm-link-self" again 

**Tips:** Choose 'link mode' if you just want to link files which will be packed, without creating bin links or running hook scripts.



## License

[ISC](./LICENSE)