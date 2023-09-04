/**
 * Override function for MD blocks.
 */
const renderer = {
  /**/
  code(text) {
    const lines = text
      .replaceAll('    ', '<span class="SongPage__space">    </span>')
      .split(/\n/)
      .map((line) => `<div class="SongPage__line">${line}</div>\n`)
      .join('');
    
    return `<section class="SongPage__verse">\n${lines}</section>`;
  },
  
  /**/
  heading(text, level) {
    switch(level) {
      case 2: return `\n<div class="SongPage__author">${text}</div>`;
      case 4: return `
                <h5 class="SongPage__verse-number">
                  <span>${text}</span>
                </h5>
              `;
    
      default: return `<h${level}>${text}</h${level}>`;
    }
  },
  
  /**/
  // link(href, title, text) {
  //
  // },
  
  /**/
  del(text) {
    return `<h5 class="SongPage__listen">${text}</h5>`;
  }
  
  // strong(text) {
  //   return `<span class="SongPage__foreign">${text}</span>`;
  // }
};

/**/
module.exports = { htmlRenderer: renderer };
