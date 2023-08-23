const ejs = require('ejs');
const { marked } = require('marked');
const path = require('path');

/**/
const { readDir, readFile, writeFile } = require('./ioHelpers');


/**
 * type Options = {
 *   inputDir: string; The relative path to the directory containing the *.md files.
 *   outputDir: string; The relative path to the output directory to store the *.html files.
 *   templateFile: string; The path to the pages' EJS template file.
 * }
 */


/**
 *
 */
class MdConverter {
  #options = {
    inputDir: void 0,
    outputDir: void 0,
    templateFile: void 0
  };
  
  /**/
  constructor(options /*Options*/) {
    this.#options = options;
    this.#run();
  }
  
  /**
   * The main method. Iterates over the input MD files.
   */
  async #run() {
    const fileNames = await readDir(this.#options.inputDir, 'md');
    fileNames.forEach(this.#processFile);
  }
  
  /**
   * Performs the dirty work of parsing.
   */
  #processFile = async (fileName) => {
    try {
      const content = await readFile(this.#options.inputDir, fileName);
      const htmlString = marked.parse(content);
      await this.#fillTemplate(htmlString, fileName);
      
    } catch(e) {
      console.error(e);
    }
  };
  
  /**
   *
   */
  async #fillTemplate(content, fileName) {
    const title = content.match(/<h1[^>]*>([^<]+)<\/h1>/)[1];
    const template = await readFile(this.#options.templateFile);
    
    const htmlString = ejs.render(template, {
      title: title,
      content: content
    });
    
    await writeFile(
      this.#options.outputDir,
      path.parse(fileName).name + '.html',
      htmlString
    );
  }
}

/**/
module.exports = { MdConverter };
