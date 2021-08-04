import {IInsightFacade, InsightResponse, InsightDatasetKind} from "./IInsightFacade";
import { Lexer } from "./Lexer";
import { Parser } from "./Parser";
import { Evaluate } from "./Evaluate"

/**
 * This is main programmatic entry point for the project.
 */
export default class InsightFacade implements IInsightFacade {
  static addedDatasets: {
    id: string; 
    kind: InsightDatasetKind; 
    numRows: number
  }[] = [];
  public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<InsightResponse> {
    // TODO: Implemented rows counter for InsightDataset   
    InsightFacade.addedDatasets.push(
      {id, kind, numRows: 0})
    var JSZip = require("jszip");
    var zip = new JSZip();
    var fcache = {};
    var str = [];
    var db = {};
    var fileChanged: boolean = false;
    var cachePath = './'+ id + 'cache.json';
    var datePath = './' + id + 'date.json';
    var fs = require("fs");

    return new Promise((resolve, reject) => {
      fs.readFile("./../test/data/courses.zip", function (err, data) {
        if (err) throw err;
         var cachedDB = {}, cachedDates = {};
      
        if (fs.existsSync(cachePath) 
            && fs.existsSync(datePath)) { 
          cachedDB = require(cachePath);
          cachedDates = require(datePath);
        } 

        zip.loadAsync(data).then(() => {
          var folderSize = Object.keys(zip.folder("courses").files).length - 1;
          var parsedFiles = 0;

          zip.folder("courses").forEach((relative, file) => {
            fcache[relative] = file.date.toJSON();

            if (typeof cachedDB != 'undefined'
              && typeof cachedDates != 'undefined'
              && typeof cachedDates[relative] !== 'undefined'
              && cachedDates[relative] == file.date.toJSON()) {
                db[relative] == cachedDB[relative];
                ++parsedFiles;
                if (parsedFiles === folderSize) {
                  if (fileChanged) {
                    fs.writeFileSync(cachePath, JSON.stringify(db));
                    fs.writeFileSync(datePath, JSON.stringify(fcache));
                  }
                  resolve({code: 204, body: null});
                }
            } else {

              file.async("string").then(function(text: string) {
                db[relative] = this.parseData(text);
                parsedFiles++
                if (parsedFiles === folderSize) {
                  fs.writeFileSync(cachePath, JSON.stringify(db));
                  fs.writeFileSync(datePath, JSON.stringify(fcache));
                  resolve({code: 204, body: null});
                }
                fileChanged = true;
              })
            }
          })
        })
      })
    })
  }

  public removeDataset(id: string): Promise<InsightResponse> {
    var fs = require("fs");
    var paths: string[] = ['./' + id + 'cache.json', './' + id + 'date.json'];
    try {
      paths.forEach(path => fs.existsSync(path) && fs.unlinkSync(path))
      return Promise.resolve({code: 204, body: null})
    } catch (err) {
      return Promise.resolve({code: 404, body: null})
    }
  }

  public performQuery(query: string): Promise<InsightResponse> {
    try { 
      let parser = new Parser(query);
      let ast = parser.parse() 
      
      const evaluate = new Evaluate(ast);
      const result = evaluate.eval()
      let InsightDataset = InsightFacade.addedDatasets;
      return Promise.resolve({code: 200, body: {result, InsightDataset}}); 
    } catch (err) {
      return Promise.resolve({code: 404, body: null})
    }
  }

  public listDatasets(): Promise<InsightResponse> {
    let addedDatasets = InsightFacade.addedDatasets;
    return Promise.reject({code: 200, body: null}) 
  }
  
  public parseData(text: string): any {
    var word: string;
    var obj = {"title": [], "id": [], "professor": [], "audit": [],
        "year": [], "course": [], "pass": [], "fail": [], "avg": [], "subject": [], "section": []}
    var keys: string[] = ["title", "id", "professor", "audit",
        "year", "course", "pass", "fail", "avg", "subject", "section"];
    var firstIndex: number = 0; 
    var secondIndex: number = 0;
    var splitText: string[] = text.split('\n');

    for (var j = 1; j < splitText.length; j++) {
      for (var i = 0; i < splitText[j].split('|').length; i++) {
          secondIndex = splitText[j].indexOf('|', firstIndex + 1);
          word = splitText[j].slice(firstIndex, secondIndex).replace("|", "");
          firstIndex = secondIndex;
          obj[keys[i]].push(word);
      }
      firstIndex = 0, secondIndex = 0;
    } 
    return obj;
  }
}

(async () => {
  let insightFacade = new InsightFacade;
  insightFacade.addDataset("courses", "./../test/data/courses.zip", InsightDatasetKind["courses"])
  let r = await insightFacade.performQuery("In courses dataset courses, find entries whose Average is greater than 97; show Department and Average; sort in ascending order by Average.")
  console.log(r.body["result"])
  console.log(r.body["InsightDataset"])
})()
