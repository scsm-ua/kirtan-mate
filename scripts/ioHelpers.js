const fsPromises = require('fs/promises');
const path = require('path');


/**
 * @param pathTo {string}
 * @param fileName? {string}
 * @returns {Promise<string>}
 */
async function readFile(pathTo, fileName = '') {
  try {
    return await fsPromises.readFile(
      path.join(pathTo, fileName),
      'utf-8'
    );
  } catch(e) {
    console.error(e);
  }
}

/**
 * Returns a list of filenames.
 * @param dirName {string}
 * @param acceptedExtension? {string}
 * @returns {Promise<string[]>}
 */
async function readDir(dirName, acceptedExtension) {
  try {
    const fileNames = await fsPromises.readdir(dirName);
    
    if (acceptedExtension) {
      const regexp = new RegExp(`\\.${acceptedExtension}$`);
      return fileNames.filter((name) => regexp.test(name));
    }
    
    return fileNames;
    
  } catch(e) {
    console.error(e);
  }
}

/**
 * @param pathTo {string}
 * @param fileName {string}
 * @param content {string}
 * @returns {Promise<*|undefined>}
 */
async function writeFile(pathTo, fileName, content) {
  try {
    return await fsPromises.writeFile(
      path.join(pathTo, fileName),
      content
    );
  } catch(e) {
    console.error(e);
  }
}


/**/
module.exports = {
  readDir, readFile, writeFile
};
