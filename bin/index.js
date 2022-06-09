#!/usr/bin/env node

function main(args) {
  if (args.includes('--version')) {
    const path = require('path');
    const fs = require('fs');
    let pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), {encoding: 'utf-8'}));
    console.log(pkg.version);
  } else if (args.includes('--help')) {
    process.stdout.write(`Usage: npm-link-self [options]
options:
  --install       also create bin links (under ./node-modules/.bin) and run hook scripts (in package.json#scripts)
`);
    process.exit(0);
  } else {
    require(args.includes('--install') ? './link-self-install.js' : './link-self.js').main(args);
  }
}

if (require.main === module) {
  main(process.argv.slice(2));
} else {
  module.exports = {
    main
  };
}
