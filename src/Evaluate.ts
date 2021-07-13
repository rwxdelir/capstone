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

const VALID_KEYS = {
  'subject'  : 'dept',
  'course'   : 'id',
  'avg'      : 'avg',
  'professor': 'instructor',
  'title'    : 'title',
  'pass'     : 'pass',
  'fail'     : 'fail',
  'audit'    : 'audit',
  'id'       : 'uuid'
}

class Evaluate {
  _db;
  _ast;
  _cursor = 0;
  _node;
  _datasetKind;
  constructor(db, ast) {
     this._db = db;
     this._ast = ast;
     this._node = this._ast[this._cursor];

     /* TODO: Implement DATASET */
     this._datasetKind = "courses";
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
    if (crt.type !== "M_CRITERIA" && crt.type !== "S_CRITERIA") {
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
    this._db = result
    //return result;
  }

  evaluateDisplay() {
    if (this._node.type !== "DISPLAY") {
      return null;
    }
    
    let displayKeys = {};
    for (let displayKey of this._node.value) {
      displayKeys[KEYS[displayKey.value[0].value]] = true;
    }

    let result = {};
    for (let file in this._db) {
      for (let key in this._db[file]) {
        if (displayKeys[key]) {
          for (let i = 0; i < this._db[file][key].length; i++) {
            if (typeof result[key] == 'undefined') {
              result[key] = []
            }
            result[key].push(this._db[file][key][i]);
          }
        }
      }
    }

    let len = result[KEYS[this._node.value[0].value[0].value]].length;
    let readableResult = [];
    for (let i = 0; i < len; i++) {
      let tmp = {};
      for (let key in displayKeys) {
        let validKey = this._datasetKind + "_" + VALID_KEYS[key]
        tmp[validKey] = result[key][i];
      }
      readableResult.push(tmp);
    }
    
    this._db = readableResult;
    console.log(this._db)
    console.log(this._node);
    console.log(this._ast)
  }

  eval() {
    while(this.hasMoreNodes()) {
      this.evaluateFilter();
      this.evaluateDisplay();
      this.nextNode()
    }
  }
}

