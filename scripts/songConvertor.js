const ejs = require('ejs');
const { marked } = require('marked');
const path = require('path');
const { Transform } = require('stream');
const VinylStream = require('vinyl-source-stream')

/**/
const { auxTransform } = require('./auxTransform');
const { convertMDToJSON, getIndexJSON } = require('../scripts/indexGenerator');
const { htmlRenderer } = require('./htmlRenderer');
const { PATHS } = require('../scripts/constants');
const { BUILD, SRC, FILES } = PATHS;

marked.use({ renderer: htmlRenderer });

/**
 *
 */
function convert(content, template) {
  const htmlString = marked.parse(content);
  return fillTemplate(template, auxTransform(htmlString));
}

/**
 *
 */
function fillTemplate(template, content) {
  const title = content.match(/<h1[^>]*>([^<]+)<\/h1>/)[1];

  const paths = {
    toCss: path.relative(BUILD.HTML_FILES, BUILD.CSS_FILES),
    toIcons: path.relative(BUILD.HTML_FILES, BUILD.ICON_FILES),
    toPartials: path.join(process.cwd(), SRC.EJS_PARTIALS_FILES)
  };
  
  return ejs.render(template, {
    content: content,
    contentItems: JSON.stringify(require(BUILD.INDEX_FILE)),
    paths: paths,
    title: title
  });
}

/**
 *
 */
function convertor(templatePromise) {
  return new Transform({
    objectMode: true,
  
    transform(file, encoding, callback) {
      try {
        const htmlString = convert(file.contents.toString(), templatePromise);
        file.contents = Buffer.from(htmlString, 'utf8');
        
        this.push(file);
        callback();
      
      } catch (error) {
        callback(error);
      }
    }
  });
}

/****************************/
/* Markdown to JSON section */
/****************************/

/**
 *
 */
function md2json() {
  return new Transform({
    objectMode: true,
    
    transform(file, encoding, callback) {
      try {
        const jsonString = JSON.stringify(convertMDToJSON(file.contents.toString()), null, 2);
        file.contents = Buffer.from(jsonString, 'utf8');
        
        this.push(file);
        callback();
        
      } catch (error) {
        callback(error);
      }
    }
  });
}

/****************************/
/* Generate JSON index      */
/****************************/

/**
 *
 */
function getJSONIndexStream() {
  const stream = VinylStream(FILES.JSON.INDEX);
  stream.end(JSON.stringify(getIndexJSON(), null, 2));
  return stream;
}

/**/
module.exports = {
  md2jsonConvertor: md2json,
  songConvertor: convertor,
  getJSONIndexStream: getJSONIndexStream
}
