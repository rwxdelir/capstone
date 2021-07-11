import { Parser } from "./Parser";

const KEYS = {
  'Average': 'avg'
}

class Evaluate {
  _db;
  _ast;
  _cursor = 0;
  _node;
  constructor(db, ast) {
     this._db = db;
     this._ast = ast;
     this._node = this._ast[this._cursor];
  }

  nextNode() {
    if (this.hasMoreNodes()) {
      ++this._cursor;
      this._node = this._ast[this._cursor];
    }
  }

  hasMoreNodes() {
    return this._cursor <= this._ast.length - 1;
  }
 
  relationalOperation(left, right, op) {
    if (op == "is greater than") {
      return left > right;
    } else if (op == "is less than") {
      return left < right;
    } else if (op == "is not greater than") {
      return !(left > right);
    } else if (op == "is not less than") {
      return !(left < right);
    }
    return null;
  }
  
  equalityOperation(left, right, op) {
    if (op == "equal to") {
      return left == right;
    } else if ("not equal to") {
      return left !== right;
    }
    return null;
  }

  evaluateFilter() {
    if (this._node.type !== "FILTER") {
      return null;
    }
   
    let conditions = this._node.value;
    if (conditions.length < 1) {
     // TODO 
    }
    
    let result = {};
    for (let condition of conditions) {
      let criteria = condition.value[0];
      let left = criteria.value[0].value;
      let op = criteria.value[1].value;
      let right = criteria.value[2].value;
      let searchKey = KEYS[left];
      if (criteria.type == "M_CRITERIA") {
        for (let file in this._db) {
          let indexes = [];
          for (let i = 0; i < this._db[file][searchKey].length; i++) {
            let comparison = this.relationalOperation(
              this._db[file][searchKey][i], 
              Number(right), 
              op
            );
            let equation = this.equalityOperation(
              this._db[file][searchKey][i], 
              Number(right), 
              op
            );
            if (comparison) {
              indexes.push(i);
            }
          }
          if (indexes.length > 0) {
            for (let el in this._db[file]) {
              for (let j = 0; j < this._db[file][el].length; j++) { 
                for (let i = 0; i < indexes.length; i++) {
                  if (indexes[i] == j) {
                    if (typeof result[file] == "undefined") {
                      result[file] = {};
                    }
                    if (typeof result[file][el] == "undefined") {
                      result[file][el] = [];
                    }
                    result[file][el].push(this._db[file][el][indexes[i]])
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  eval() {
    while(this.hasMoreNodes()) {
      this.evaluateFilter();
      this.nextNode()
    }
  }
}

