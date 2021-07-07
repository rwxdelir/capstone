let Spec = [
  [/^is not greater than/, "M_OP"],
  [/^is greater than/, "M_OP"],
  [/^is less than/, "M_OP"],
  [/^is not less than/, "M_OP"],
  [/^is equal to/, "M_OP"],
  [/^is not equal to/, "M_OP"],
  [/^includes/, "S_OP"],
  [/^does not include/, "S_OP"],
  [/^is not/, "S_OP"],
  [/^is/, "S_OP"],
  [/^begins with/, "S_OP"],
  [/^does not begin with/, "S_OP"],
  [/^ends with/, "S_OP"],
  [/^does not end with/, "S_OP"],
  [/^sort in ascending order by/, "ORDER"],
  [/^".*?"/, "STRING"],
  [/^\d+/, "NUMBER"],
  [/^\s/, "WHITESPACE" ],
  [/^\,/, "COMMA" ],
  [/^\;/, "SEMICOLON" ],
  [/^\./, "DOT"],
  [/^courses/, "KIND"],
  [/^In/, "KEYWORD"],
  [/^dataset/, "KEYWORD"],
  [/^find/, "KEYWORD"],
  [/^all/, "KEYWORD"],
  [/^show/, "KEYWORD"],
  [/^and/, "KEYWORD"],
  [/^or/, "KEYWORD"],
  [/^sort/, "kEYWORD"],
  [/^by/, "KEYWORD"], 
  [/^entries/, "KEYWORD"],
  [/^is/, "kEYWORD"],
  [/^the/, "KEYWORD"],
  [/^of/, "KEYWORD"],
  [/^whose/, "KEYWORD"],
  [/^Average/, "M_KEY"],
  [/^Pass/, "M_KEY"],
  [/^Fail/, "M_KEY"],
  [/^Pass/, "M_KEY"],
  [/^Fail/, "M_KEY"],
  [/^Audit/, "M_KEY"],  
  [/^Department/, "S_KEY"],
  [/^ID/, "S_KEY"],
  [/^Instructor/, "S_KEY"],
  [/^Title/, "S_KEY"],
  [/^UUID/, "S_KEY"]

]

class Lexer {
  /**
   * Initializes the string.
   */
  init(string) {
    this._string = string
    this._cursor = 0;
  }

  hasMoreTokens() {
    return this._cursor < this._string.length
  }

  getNextToken() {
    if (!this.hasMoreTokens()) {
      return null;
    }
    
    const string = this._string.slice(this._cursor);

    for (const [regexp, tokenType] of Spec) {
      const tokenValue = this._match(regexp, string);
      
      if (tokenValue == null) {
        continue;
      }

      if (tokenType == "STRING") {
        tokenValue.toString();
      }

      return {
        type: tokenType,
        value: tokenValue,
      };
    }
  }

  _match(regexp, string) {
    const matched = regexp.exec(string);
    if (matched == null) {
      return null;
    }
    this._cursor += matched[0].length;
    return matched[0];
  }

}

const q1 = 'In courses dataset courses, find entries whose Average is greater than 97; show Department and Average; sort in ascending order by Average.'

const q2 = 'In courses dataset courses, find entries whose Average is greater than 90 and Department is \"adhe\" or Average is equal to 95; show Department, ID and Average; sort in ascending order by Average.'

const lexer = new Lexer()
lexer.init(q2)
for (;;) {
  let token = lexer.getNextToken();
  if (token == null) {
    break;
  }

  if (token.type == "WHITESPACE") {
    continue;
  }

  console.log(token)
}


