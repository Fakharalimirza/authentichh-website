const path = require('path');
const fs = require('fs');

const SIZES = ['thumb', 'small', 'medium', 'large'];

function getVariantPath(basePath, size) {
  return basePath + '-' + size + '.webp';
}

function deleteImageVariants(basePath) {
  for (const size of SIZES) {
    const fp = getVariantPath(basePath, size);
    if (fs.existsSync(fp)) {
      fs.unlinkSync(fp);
    }
  }
  if (fs.existsSync(basePath)) {
    fs.unlinkSync(basePath);
  }
}

module.exports = { deleteImageVariants, getVariantPath, SIZES };
