import {IInsightFacade, InsightResponse, InsightDatasetKind} from "./IInsightFacade";

/**
 * This is main programmatic entry point for the project.
 */
export default class InsightFacade implements IInsightFacade {
  public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<InsightResponse> {

    return Promise.resolve({code: 204, body: null});
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

var insightFacade = new InsightFacade();
console.log(insightFacade)
console.log(insightFacade.addDataset("courses", "../courses.zip", InsightDatasetKind.Courses));
