function isAlpha(c) {
  return ("a" <= c && c <= "z") || ("A" <= c && c <= "Z");
}

function isNumeric(c) {
  return "0" <= c && c <= "9";
}

function lexer(query) {
  let cursor = 0;
  let char = query[cursor];

  function next() {
    cursor++;
    char = query[cursor];
  }
  
  const KEYWORDS = {
    In     :  'In',                   
    dataset:  'dataset',   
    find   :  'find', 
    all    :  'all', 
    show   :  'show', 
    and    :  'and', 
    or     :  'or', 
    sort   :  'sort', 
    by     :  'by',
    entries:  'entries', 
    the    :  'the', 
    of     :  'of',
    whose  :  'whose',
    is     :  'is'
  }
  
  const M_KEY = {
    Average: 'Average',    
    Pass   : 'Pass', 
    Fail   : 'Fail',  
    Audit  : 'Audit'
  }
  const S_KEY = {
    Department: 'Department', 
    ID        : 'ID',
    Instructor: 'Instructor', 
    Title     : 'Title', 
    UUID      : 'UUID'
  }

  const KIND = {
    courses: 'courses'
  }

  const M_OP_KEYWORD = {
    greater: "greater",
    less: "les",
    equal: "equal",
    not: "not",
    to: "to",
    than: "than"
  }

  const M_OP = {
    "greater than": 'greater than',
    "less than": 'less than',
    "equal to": 'equal to',
    "not greater than": 'not greater than',
    "not less than": 'not less than',
    "not equal to": 'not equal to'
  }
  
  const SORT = {
    "in ascending order ": "ascending" 
  }

  function number() {
    let buffer = "";
    
    while (isNumeric(char)) {
      buffer += char;
      next();
    }

    if (buffer.length >= 1) {
      return {
        type: "number",
        value: Number(buffer),
      };
    }

    return null;
  }

  function stringOfType(delimiter) {
    if (char !== delimiter) return null;
    let buffer = "";
    next();
    while (char !== delimiter) {
      buffer += char;
      next();
    }

    next(); // last delimiter

    return {
      type: "String",
      value: buffer
    };
  }

  function string() {
    return stringOfType('"') || stringOfType("'");
  }

  function keyToken() {
    let buffer = "";

    while (isAlpha(char) || isWhitespace(char))  {
      buffer += char;
      next();
      let keyword = KEYWORDS[buffer];
      if (keyword) {
        return {
          type: "KeywordToken",
          value: keyword
        }
      }
      
      let m_op = M_OP[buffer];
      if (m_op) {
        return {
          type: "mOpToken",
          value: m_op
        }
      }

      let m_key = M_KEY[buffer];
      if (m_key) {
        return {
          type: "mKeyToken",
          value: m_key
        }
      }

      let s_key = S_KEY[buffer];
      if (s_key) {
        return {
          type: "sKeyToken",
          value: s_key
        }
      }

      let kind = KIND[buffer];
      if (kind) {
        return {
          type: "KindToken",
          value: kind
        }
      }

      let sort = SORT[buffer];
      if (sort) {
        return {
          type: "SortToken",
          value: sort
        }
      }
    }


    return null;
  }

  function isWhitespace(c) {
    return c === " " || c === "\t" || char === ',' || char === ';' ;
  }
  
  function eof() {
    if (char === undefined || char === '.') {
      return {
        type: "EndOfFileToken"
      };
    }

    return null;
  }

  function whitespace() {
    if (!isWhitespace(char)) {
      return null;
    }
    next();

    while (isWhitespace(char)) {
      next();
    }

    return {
      type: "Whitespace"
    };
  }
  
  let tokens = [];
  for (;;) {
    const token = whitespace() || keyToken() || number() || string() || eof();

    tokens.push(token)

    if (token.type === 'EndOfFileToken'){
      return tokens; 
    }
  }
}

let q1 = 'In courses dataset courses, find entries whose Average is greater than 97; show Department and Average; sort in ascending order by Average.'
let q2 = 'In courses dataset courses, find entries whose Average is greater than 90 and Department is \"adhe\" or Average is equal to 95; show Department, ID and Average; sort in ascending order by Average.'

console.log(lexer(q2));
