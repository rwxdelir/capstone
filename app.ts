"use strict"

var fs = require("fs")

var JSZip = require("jszip");
var zip = new JSZip();
var fcache = {};
var db = {};

function parseData(text) {
  var obj = {"title": [], "id": [], "professor": [], "audit": [], "year": [], "course": [], "pass": [],"fail": [], "avg": [], "subject": [], "section": [] };
  var word;
  var keys = ["title", "id", "professor", "audit", 
    "year", "course", "pass", "fail", "avg", "subject", "section"];

  var firstIndex = 0;
  var secondIndex = 0;
  var splitText = text.split('\n'); 
  
  for (let j = 1; j < splitText.length; j++) {
    for (let i = 0; i < splitText[j].split('|').length; i++) {
      secondIndex = splitText[j].indexOf('|', firstIndex + 1)
      word = splitText[j].slice(firstIndex, secondIndex).replace("|", "")
      firstIndex = secondIndex;
      obj[keys[i]].push(word);
    }
    firstIndex = 0;
    secondIndex = 0;
  }

  return obj;
}

const myPromise = new Promise((res, reject) => {
  fs.readFile("courses.zip", function (err, data) {
    if (err) throw err;
     var cachedDB = {}, cachedDates = {};

    if (fs.existsSync('./cache.json') 
        && fs.existsSync('./datecache.json')) { 
      cachedDB = require('./cache.json');
      cachedDates = require('./datecache.json');
    } 

    zip.loadAsync(data).then(() => {
      var key, obj;
      var date;

      zip.folder("courses").forEach(function (relative, file) {
        
        fcache[relative] = file.date.toJSON();

        if (typeof cachedDates[relative] !== 'undefined' 
          && cachedDates[relative] == file.date.toJSON()) {
            db[relative] = cachedDB[relative];
        } else {
          file.async("string").then(function(text) {
            db[relative] = parseData(text);
          })
        }
      })
      // Сообщает о завершение считывания архива
      zip
        .generateNodeStream({streamFiles:false})
        .pipe(fs.createWriteStream('out.zip'))
        .on('finish', function () {
          res("Resolved")
        });
    })
  })
})

myPromise.then(() => {
  fs.writeFileSync("cache.json", JSON.stringify(db));
  fs.writeFileSync("datecache.json", JSON.stringify(fcache));

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });


  readline.question('> ', query => {
    if (query === 'SELECT') {
    }
    readline.close()
  });
})


