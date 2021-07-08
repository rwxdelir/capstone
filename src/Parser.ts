import { Lexer } from "./Lexer";

const Spec1 = [
  [["M_KEY", "M_OP", "NUMBER"], "M_CRITERIA"],
  [["S_KEY", "S_OP", "STRING"], "S_CRITERIA"]
]

class Parser {
  _tokens = [];
  _cursor;
  _token;
  constructor(query) {
    const lexer = new Lexer();
    lexer.init(query);

    let lookahead = lexer.getNextToken();
    this._token = lookahead;
    this._cursor = 0;
    while (lexer.hasMoreTokens()) {
      if (lookahead.type == "WHITESPACE" || lookahead.value == "and") {
        lookahead = lexer.getNextToken();
        continue;
      }
      this._tokens.push(lookahead)
      lookahead = lexer.getNextToken();
    }
    
  }
  
  isTokenizerEnd() {
    return this._token.type === "DOT" || this._cursor >= this._tokens.length-1
  }

  nextToken() {
    ++this._cursor;
    this._token = this._tokens[this._cursor];
  }
  
  parse() {
    let buffer = [];
    let start
    let deleteCount = 0;
    let newType = null;
    while (!this.isTokenizerEnd()) {
      for (const [types, genericType] of Spec1) {
        for (let j = 0; j < types.length; j++) {
          if (types[j] !== this._token.type) {
            buffer = [];
            newType = null;
            break;  
          }
          if (typeof start == 'undefined') {
            start = this._cursor;
            newType = genericType;
          }
          buffer.push(this._token);
          this.nextToken();
        }
        if (buffer.length > 0) {
          //console.log("Start " + start + " Len " + buffer.length)
          this._tokens.splice(start, buffer.length, {
            type: newType,
            value: buffer
          })
          //console.log(this._tokens)
          this._cursor = 0;
          this._token = this._tokens[0];
          newType = null;
          buffer = [];
          start = undefined;
        }
      }

      this.nextToken();
    }
    return this._tokens;
  }
}

let q1 = 'In courses dataset courses, find entries whose Average is greater than 97 and Department is \"adhe\"; show Department and Average; sort in ascending order by Average.'

let parser = new Parser(q1);
//console.log(parser.parse());

