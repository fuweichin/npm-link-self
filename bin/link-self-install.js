#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
const child_process = require('child_process');
const util = require('util');
const execAsync = util.promisify(child_process.exec);

let pkg = null;
function loadPackageJSON() {
  return fsPromises.readFile('package.json', {encoding: 'utf-8'}).then(JSON.parse);
}
function getPackedFilename() {
  let {name, version} = pkg;
  let filename;
  if (name.startsWith('@')) {
    filename = name.slice(1).replace(/[/]/, '-') + '-' + version + '.tgz';
  } else {
    filename = name + '-' + version + '.tgz';
  }
  return filename;
}
function passExecOutput(proc) {
  let {stdout, stderr} = proc;
  if (stderr) {
    process.stderr.write(stderr);
  }
  if (stdout) {
    process.stdout.write(stdout);
  }
  return proc;
}
function installSelf() {
  let cacheDir = path.join('node_modules', '.cache');
  let tgzFile = path.join(cacheDir, getPackedFilename());
  return fsPromises.mkdir(cacheDir, { // mkdir -p node_modules/.cache
    recursive: true
  }).then(() => {
    return execAsync('npm pack --pack-destination "' + cacheDir + '"').then(passExecOutput);
  }).then(() => {
    return execAsync('npm install --no-save --only=prod --no-optional ' + tgzFile).then(passExecOutput);
  });
}
function walkFilesSync(context, filter, next) {
  let listFiles0 = (dir, prefix) => {
    let names = fs.readdirSync(dir);
    for (let name of names) {
      let relPath = path.join(prefix, name);
      let absPath = path.resolve(context, relPath);
      let stat = fs.lstatSync(absPath);
      if (stat.isSymbolicLink()) {
        // SKIP symlinks
      } else if (stat.isDirectory()) {
        if (filter(name, stat)) {
          listFiles0(absPath, relPath);
        }
      } else {
        if (filter(name, stat)) {
          next(name, relPath, stat);
        }
      }
    }
  };
  listFiles0(context, '');
}
function linkSelf() {
  let {name} = pkg;
  let relPrefix;
  if (name.startsWith('@') && name.indexOf('/') !== -1) {
    relPrefix = '../../..';
  } else {
    relPrefix = '../..';
  }
  let destDir = path.join('node_modules', name);
  walkFilesSync(destDir, () => true, (name, relPath, stat) => {
    let symlink = path.join(destDir, relPath);
    let target = path.join(relPrefix, path.relative(path.dirname(relPath), '.'), relPath);
    fs.rmSync(symlink);
    fs.symlinkSync(target, symlink, 'file');
  });
}

function main(args) {
  let t0 = Date.now();
  return loadPackageJSON().then((obj) => {
    pkg = obj;
  }).then(installSelf).then(linkSelf).then(() => {
    let t = Date.now() - t0;
    process.stdout.write('\nlinked self in ' + (t < 1000 ? t + 'ms' : (t / 1000).toFixed(0) + 's') + '\n');
    process.exitCode = 0;
  }, (err) => {
    process.stderr.write(err.stack);
    process.exitCode = 1;
  });
}

if (require.main === module) {
  main(process.argv.slice(2));
} else {
  module.exports = {
    main
  };
}
