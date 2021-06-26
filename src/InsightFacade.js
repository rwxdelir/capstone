"use strict";
exports.__esModule = true;
var IInsightFacade_1 = require("./IInsightFacade");
/**
 * This is main programmatic entry point for the project.
 */
var InsightFacade = /** @class */ (function () {
    function InsightFacade() {
    }
    InsightFacade.prototype.addDataset = function (id, content, kind) {
        return Promise.resolve({ code: 204, body: null });
    };
    InsightFacade.prototype.removeDataset = function (id) {
        return Promise.resolve({ code: 204, body: null });
    };
    InsightFacade.prototype.performQuery = function (query) {
        return Promise.resolve({ code: 200, body: { result: null } });
    };
    InsightFacade.prototype.listDatasets = function () {
        return Promise.reject({ code: -1, body: null });
    };
    return InsightFacade;
}());
exports["default"] = InsightFacade;
var insightFacade = new InsightFacade();
console.log(insightFacade);
console.log(insightFacade.addDataset("courses", "../courses.zip", IInsightFacade_1.InsightDatasetKind.Courses));
