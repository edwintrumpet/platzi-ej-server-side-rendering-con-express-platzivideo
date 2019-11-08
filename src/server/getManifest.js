import fs from 'fs';

const getManifest = () => {
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(`${__dirname}/public/manifest.json`, 'utf8'));
  } catch (err) {
    console.log(err);
  }
  return manifest;
};

export default getManifest;
