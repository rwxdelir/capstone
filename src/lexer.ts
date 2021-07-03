let q1 = 'In courses dataset courses, find entries whose Average is greater than 97; show Department and Average; sort in ascending order by Average.'

function lexer(str) {  
  let cursor = 0;
  let turn = str
    .split(/,|;/)
    .map(x => x[0] === " " ? x.replace(" ", "") : x);
  let cmd = turn[0];

  function next() {
    cursor++;
    cmd = turn[cursor];
  }

  function kindToken() {
    return "courses";
  }

  function inputToken() {
    return "courses";
  }
    
  function datasetToken() {
    const start = cursor;
    let kind = kindToken();
    let input = inputToken();
    let dataset = 'In ' + kind + ' dataset ' + input;
    
    if (cmd === dataset) {
      return {
        type: "dataset",
        kind,
        input
      };
    }

    return null;
  }
  
  function m_op() {
    let result;
    if (cmd.includes('is greater than')) {
      return ">";
    } 
    // TODO: Continue sequence 
  }

  function mCriteria() {
    // TODO: Implement several criteria support
    let key = cmd.search('Average|Pass|Fail|Audit');
    let m = m_op(); 
    let number = cmd.search(/\d+/)
     
    if (key != -1) {
      return {
        key: cmd.slice(key, cmd.indexOf(" ", key)),
        m_op: m, 
        number: +cmd.match(/\d+/)[0]
      }
    }
    return null
  }

  function criteriaToken() {
    let mCriteriaToken = mCriteria();
    return {
      type: "CriteriaToken",
      mCriteriaToken
    }
  }

  function filterToken() {
    let allEntries = cmd.includes('find all entries');
    let whoseEntries = cmd.includes('find entries whose ')
    if (whoseEntries) {
      let criteria = criteriaToken();
      return {
        type: "filter",
        criteria
      }
    }
    return null;
  }
  
  let tokens = [];
  for (;;) {
    let token = datasetToken() || filterToken();
    if (token) {
      tokens.push(token);
      next();
    } else {
      return tokens;
    }
  }
}

console.log(lexer(q1)[1])
