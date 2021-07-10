import { Lexer } from "./Lexer";

const Spec1 = [
[
  [["M_KEY", "M_OP", "NUMBER"], "M_CRITERIA"],
  [["S_KEY", "S_OP", "STRING"], "S_CRITERIA"]
],[
  [["M_CRITERIA"], "CRITERIA"],
  [["S_CRITERIA"], "CRITERIA"],
  [["M_KEY"], "KEY"],
  [["S_KEY"], "KEY"]
]
]

const CMD = {
  "findentries": "FILTER",
  "sort in ascending order"
}



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
    for (;;) {
      if (lookahead == null) { break; }
      if (lookahead.type == "WHITESPACE" || lookahead.value == "and" 
        || lookahead.value == "whose" ) {
        lookahead = lexer.getNextToken();
        continue;
      }

      this._tokens.push(lookahead)
      lookahead = lexer.getNextToken();
    }
  }
  
  isTokenizerEnd() {
    return this._tokens[this._cursor].type == "DOT" || this._cursor >= this._tokens.length - 1
  }

  nextToken() {
    if (!this.isTokenizerEnd()) {
      ++this._cursor;
      this._token = this._tokens[this._cursor];
    }
  }

  spotCmd() {
    let buffer = "";

    while(!this.isTokenizerEnd() && this._token.type === "KEYWORD") {
      buffer += this._token.value;
      this.nextToken();
    }

    let cmd = CMD[buffer];
    if (cmd) {
      return cmd 
    }

    return null;
  }
  
  parse(depth) {
    let buffer = [];
    let start
    let deleteCount = 0;
    let newType = null;
    let deep = depth;
    let level = Spec1[deep];
    this._cursor = 0;
    this._token = this._tokens[0]
    if (depth == 0 || depth == 1) {
      while (!this.isTokenizerEnd()) {
        for (const [types, genericType] of level) {
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
            console.log(buffer)
            this._tokens.splice(start, buffer.length, {
              type: newType,
              value: buffer
            })
            this._cursor = 0;
            this._token = this._tokens[0];
            newType = null;
            buffer = [];
            start = undefined;
          }
        }
        this.nextToken();
      }
    } else {
      this._cursor = 0;
      this._token = this._tokens[0]
      let buffer = [];
      let command = "";
      let start, end;
      while (!this.isTokenizerEnd()) {
        command = this.spotCmd();
        if (command == "FILTER") {
          start = this._cursor - 2;
          while (this._token.type !== "SEMICOLON") {
            buffer.push(this._token);
            this.nextToken();
          }
          this._tokens.splice(start, buffer.length + 3, {
            type: command, 
            value: buffer
          })
          buffer = [];
        } else if (command == "ORDER") {
          start = this._cursor - 1;
          while (this._token.type !== "DOT") {
            buffer.push(this._token);
            this.nextToken()
          }
          this._tokens.splice(start, buffer.length + 1, {
            type: command,
            value: buffer
          })
        }

        this.nextToken();
      }
    }
    return this._tokens;
  }
}

let q1 = 'In courses dataset courses, find entries whose Average is greater than 97 and Department is \"adhe\"; show Department and Average; sort in ascending order by Average.'

let parser = new Parser(q1);
for (let i = 0; i < 3; i++) {
  console.log(parser.parse(i));
}

