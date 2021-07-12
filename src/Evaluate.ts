import { Parser } from "./Parser";

const KEYS = {
  'Department': 'subject',    // string 
  'ID'        : 'course',     // string 
  'Average'   : 'avg',        // number
  'Instructor': 'professor',  // string 
  'Title'     : 'title',      // string
  'Pass'      : 'pass',       // number 
  'Fail'      : 'fail',       // number 
  'Audit'     : 'audit',      // number
  'UUID'      : 'id'          // string 
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
    if (!isNaN(right) && !isNaN(left)) {
      if (op == "is greater than") {
        return left > right;
      } else if (op == "is less than") {
        return left < right;
      } else if (op == "is not greater than") {
        return !(left > right);
      } else if (op == "is not less than") {
        return !(left < right);
      }
    }
    return null;
  }
  
  equalityOperation(left, right, op) {
    if (!isNaN(right) && !isNaN(left)) {
      if (op == "is equal to") {
        return Number(left) == Number(right);
      } else if (op == "is not equal to") {
        return Number(left) !== Number(right);
      } 
    } else if (op == "is") {
      return left == right.slice(1, -1);
    } else if (op == "is not") {
      return left == right.slice(1, -1);
    }
    return null;
  }

  evaluateCriteria(crt, db) {
    if (crt !== "M_CRITERIA" || crt !== "S_CRITERIA") {
      /* TODO: Should throw error instead of null */
      return null;  
    }

    let left = crt.value[0].value;
    let op = crt.value[1].value;
    let right = crt.value[2].value;
    let searchKey = KEYS[left];
    let result = {};
    
    for (let file in db) {
      let indexes = [];
      for (let i = 0; i < db[file][searchKey].length; i++) {
        let comparison = this.relationalOperation(
          db[file][searchKey][i], 
          right, 
          op
        );
        let equation = this.equalityOperation(
          db[file][searchKey][i], 
          right, 
          op
        );
        if (comparison || equation) {
          indexes.push(i);
        }
      }

      if (indexes.length > 0) {
        for (let el in db[file]) {
          for (let j = 0; j < db[file][el].length; j++) { 
            for (let i = 0; i < indexes.length; i++) {
              if (indexes[i] == j) {
                if (typeof result[file] == "undefined") {
                  result[file] = {};
                }
                if (typeof result[file][el] == "undefined") {
                  result[file][el] = [];
                }
                result[file][el].push(db[file][el][indexes[i]])
              }
            }
          }
        }
      }
    }
    return result;
  }

  evaluateFilter() {
    if (this._node.type !== "FILTER") {
      return null;
    }
   
    let conditions = this._node.value;
    let result = this._db;
    let buffer = [];
    for (let condition of conditions) {
      if (condition.type == "CRITERIA") {
        result = this.evaluateCriteria(condition.value[0], result)
      } 
      /* Save last result to buffer & reassign result to initial DB */
      else if (condition.value == "or") {
        buffer.push(result)
        result = this._db;
      }
    }

    /* If OR operator was used, append objects from buffer to result */
    if (buffer.length > 0) {
      for (let i = 0; i < buffer.length; i++) {
        let tmp = buffer[i];
        for (let file in tmp) {
          if (typeof result[file] == "undefined") {
            result[file] = tmp[file]
          } else {
            for (let tmpKey in tmp[file]) {
              for (let tmpId in tmp[file][tmpKey]) {
                if (typeof result[tmpKey][tmpId] == "undefined") {
                  result[file][tmpKey][tmpId] = tmp[file][tmpKey][tmpId];
                }
              }
            }
          }
        }
      }
    }

    return result;
  }

  eval() {
    while(this.hasMoreNodes()) {
      this.evaluateFilter();
      this.nextNode()
    }
  }
}

