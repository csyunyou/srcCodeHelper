const stream = require('stream');
const util = require('util');
class ReplaceStream extends stream.Transform {
  constructor(searchString, replaceString) {
    super();
    this.searchString = searchString;
    this.replaceString = replaceString;
    this.tailPiece = '';
  }
  _transform(chunk, encoding, callback) {
  	console.log(chunk)
    const pieces = (this.tailPiece + chunk) //[1]
      .split(this.searchString);
    const lastPiece = pieces[pieces.length - 1];
    const tailPieceLen = this.searchString.length - 1;
    this.tailPiece = lastPiece.slice(-tailPieceLen); //[2]
    pieces[pieces.length - 1] = lastPiece.slice(0, -tailPieceLen);
    this.push(pieces.join(this.replaceString)); //[3]
    callback();
  }
  _flush(callback) {
    this.push(this.tailPiece);
    callback();
  }
}
const rs = new ReplaceStream('World', 'Node.js');
rs.on('data', chunk => console.log(chunk.toString()));
rs.write('Hello W');
rs.write('orld!');
rs.end();
console.log('a_world'.split('world'))