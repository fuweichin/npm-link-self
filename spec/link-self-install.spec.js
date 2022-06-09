const fs = require('fs');
const fsPromises = require('fs/promises');
const {main} = require('../bin/link-self-install.js');

describe('link-self-install', () => {
  let installationDir = './node_modules/npm-link-self';
  let dotBinDir = './node_modules/.bin';
  beforeEach(async () => {
    if (fs.existsSync(installationDir)) {
      await fsPromises.rm(installationDir, {recursive: true, force: true});
    }
    if (fs.existsSync(dotBinDir)) {
      await fsPromises.rm(dotBinDir, {recursive: true, force: true});
    }
  });
  it('link-self-install', async () => {
    await main(['--install']);
    expect(fs.existsSync(installationDir + '/package.json')).toBe(true);
    expect(fs.existsSync(dotBinDir + '/npm-link-self.cmd')).toBe(true);
  });
});
