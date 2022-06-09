#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const util = require('util');
const execAsync = util.promisify(child_process.exec);

function getManifest() {
  return execAsync('npm pack --dry-run --json ./').then(({stdout, stderr}) => {
    if (stderr) {
      process.stderr.write(stderr);
    }
    return JSON.parse(stdout)[0];
  });
}
function createDirsAndSymlinks(manifest) {
  let {name} = manifest;
  let srcDir = '.';
  let destDir = path.join('node_modules', name);
  let relPrefix = path.relative(destDir, srcDir);
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, {recursive: true, force: true}); // rm -rf ${destDir}
  }
  fs.mkdirSync(destDir, {recursive: true}); // mkdir -p ${destDir}
  let projDir = process.cwd();
  process.chdir(destDir); // pushd ${destDir}
  try {
    let files = manifest.files.map((e) => e.path);
    for (let file of files) {
      let symlink = file;
      let target;
      if (file.indexOf('/') > -1) {
        let d = path.dirname(file);
        fs.mkdirSync(d, {recursive: true}); // mkdir -p `dirname ${file}`
        target = path.join(relPrefix, path.relative(d, '.'), file);
      } else {
        target = path.join(relPrefix, file);
      }
      fs.symlinkSync(target, symlink, 'file'); // ln -s ${file} ${target}
    }
    return files;
  } finally {
    process.chdir(projDir); // popd
  }
}

function main(args) {
  let t0 = Date.now();
  return getManifest().then(createDirsAndSymlinks).then(() => {
    let t = Date.now() - t0;
    process.stdout.write('\nlinked self in ' + (t < 1000 ? t + 'ms' : (t / 1000).toFixed(0) + 's') + '\n');
    process.exitCode = 0;
  }, (err) => {
    process.stderr.write(err.toString());
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
