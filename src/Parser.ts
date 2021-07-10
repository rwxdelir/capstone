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
]]

const CMD = {
  "findentries": "FILTER",
  "sort in ascending order by": "ORDER",
  "show": "DISPLAY",
  "In": "DATASET"
}

enum AST_CMD {
  'DATASET' = 1,
  'FILTER',
  'DISPLAY',
  'ORDER'
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
        || lookahead.value == ","
        || lookahead.value == "whose" ) {
        lookahead = lexer.getNextToken();
        continue;
      }

      this._tokens.push(lookahead)
      lookahead = lexer.getNextToken();
    }
  }
  
  isTokenizerEnd() {
    return this._token.type == "DOT" || this._cursor >= this._tokens.length - 1
  }

  nextToken() {
    if (!this.isTokenizerEnd()) {
      ++this._cursor;
      this._token = this._tokens[this._cursor];
    }
  }

  cmdFilter() {
    let cmd = "";
    while (this._token.value == "find" 
      || this._token.value == "entries")  {
      cmd += this._token.value;
      this.nextToken();
    }
    let filter = CMD[cmd];
    let buffer = [];
    if (filter) {
      while(this._token.type == "CRITERIA") {
        buffer.push(this._token);
        this.nextToken();
      }
      return {
        type: filter,
        value: buffer
      } 
    }

    return null;
  }
  
  cmdOrder() {
    let cmd = "";
    if (this._token.type == "ORDER") {
      cmd += this._token.value;
      this.nextToken();
    }
    
    let order = CMD[cmd];
    let buffer = [];
    if (order) {
      while(this._token.type == "KEY") {
        buffer.push(this._token);
        this.nextToken();
      }
      return {
        type: order,
        value: buffer
      }
    }

    return null;
  }

  cmdDisplay() {
    let cmd = "";
    if (this._token.value == "show") {
      cmd = this._token.value;
      this.nextToken();
    }
    
    let display = CMD[cmd];
    let buffer = [];
    if (display) {
      while (this._token.type == "KEY") {
        buffer.push(this._token);
        this.nextToken();
      }
      return {
        type: display, 
        value: buffer
      }
    }
    
    return null;
  }
  
  cmdDataset() {
    if (this._token.value == "In") {
      let buffer = [];
      while (true) {
        buffer.push(this._token)
        if (this._token.type == "INPUT") {break;}
        this.nextToken();
      }
      return {
        type: "DATASET", 
        value: buffer 
      }
    }

    return null;
  }

  parseAst(tokenizer) {
    let ast = [];
    for (let token of tokenizer) {
      if (AST_CMD[token.type]) {
        ast.push(token);
      }
    }
    return ast;
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
      let start, end;

      while (!this.isTokenizerEnd()) {
        start = this._cursor;
        let cmd = this.cmdDisplay() || this.cmdFilter() || this.cmdOrder() || this.cmdDataset()  
        if (cmd) {
          end = this._cursor
          this._tokens.splice(start, (end - start), cmd);
          this._cursor = start;
          this._token = this._tokens[start];        
        }
        this.nextToken();
      }
      return this.parseAst(this._tokens);
    }
  }
}
      

