const fs = require('fs');
const fsPromises = require('fs/promises');
const {main} = require('../bin/link-self.js');

describe('link-self', () => {
  let installationDir = './node_modules/npm-link-self';
  beforeEach(async () => {
    if (fs.existsSync(installationDir)) {
      await fsPromises.rm(installationDir, {recursive: true, force: true});
    }
  });
  it('link-self', async () => {
    await main([]);
    expect(fs.existsSync(installationDir + '/package.json')).toBe(true);
  });
});
