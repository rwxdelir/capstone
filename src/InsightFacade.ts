import {IInsightFacade, InsightResponse, InsightDatasetKind} from "./IInsightFacade";
/**
 * This is main programmatic entry point for the project.
 */
export default class InsightFacade implements IInsightFacade {
  public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<InsightResponse> {
    var fs = require("fs");
    var JSZip = require("jszip");
    var zip = new JSZip();
    var fcache = {};
    var str = [];
    var db = {};
    var fileChanged: boolean = false;

    return new Promise((resolve, reject) => {
      fs.readFile("./../courses.zip", function (err, data) {
        if (err) throw err;
         var cachedDB = {}, cachedDates = {};
      
        if (fs.existsSync('./cache.json') 
            && fs.existsSync('./datecache.json')) { 
          cachedDB = require('./cache.json');
          cachedDates = require('./datecache.json');
        } 

        zip.loadAsync(data).then(() => {
          var folderSize = Object.keys(zip.folder("courses").files).length - 1;
          var parsedFiles = 0;

          zip.folder("courses").forEach((relative, file) => {
            fcache[relative] = file.date.toJSON();

            if (typeof cachedDates[relative] !== 'undefined' 
              && cachedDates[relative] == file.date.toJSON()) {
                db[relative] = cachedDB[relative];
                ++parsedFiles;
                if (parsedFiles === folderSize) {
                  if (fileChanged) {
                    fs.writeFileSync("cache.json", JSON.stringify(db));
                    fs.writeFileSync("datecache.json", JSON.stringify(fcache));
                  }
                  resolve({code: 204, body: null});
                }
            } else {
              file.async("string").then(function(text: string) {
                db[relative] = parseData(text);
                parsedFiles++
                if (parsedFiles === folderSize) {
                  fs.writeFileSync("cache.json", JSON.stringify(db));
                  fs.writeFileSync("datecache.json", JSON.stringify(fcache));
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
    return Promise.resolve({code: 204, body: null});
  }

  public performQuery(query: string): Promise<InsightResponse> {
    return Promise.resolve({code: 200, body: {result: null}}); 
  }

  public listDatasets(): Promise<InsightResponse> {
    return Promise.reject({code: -1, body: null}) 
  }
  
}

function parseData(text: string) {
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
  } return obj;
}

