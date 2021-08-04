export interface InsightResponse {
  code: number;
  body: InsightResponseSuccessBody | InsightResponseErrorBody; // Actual Response
}

export interface InsightResponseSuccessBody {
  result: any[] | string & InsightDataset[];
}

export interface InsightResponseErrorBody {
  error: string | any[];
}

export enum InsightDatasetKind {
  Courses = "courses",
  Rooms = "rooms",
}

export interface InsightDataset {
  id: string;
  kind: InsightDatasetKind;
  numRows: number;
}

export interface IInsightFacade {

 /**
  * @param id The id of the dataset being added.
  * @param content The base64 content of the dataset. This content should be in the form of a serialized zip file.
  * @param kind The kind of the dataset 
  * @return Promise <InsightResponse>
  *
  * The promise should be for 2XX codes and reject for everything else.
  *
  * Response codes:
  * 204: the operation was successful
  * 400: the operation failed. The body should contain  {"error": "my text"}
  * This should also be used if the provided dataset is invalid or if it was  
  * added more than once with the same id.
  */
  addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<InsightResponse>;
  
 /**
  * Remove a dataset from UBCInsight.
  *
  * @param id The id of the dataset to remove.
  * @return Promise <InsightResponse>
  *
  * Fulfill should be for 2XX codes and reject for everything else.
  * 
  * Response codes:
  * 204: The operation was successful.
  * 404: the operation was unsuccessful because the delete was for a resourse that
  * was not previously added
  *
  */
  removeDataset(id: string): Promise<InsightResponse>;
  
 /** 
  * Perform a query on UBCInsight.
  * @param query The to be performed. This is the same as the body of the POST message.
  * @return Promise <InsightResponse>
  * 
  * Fulfill should be for 2XX codes and reject for everything else.
  *
  * Return codes:
  * 200: the query was succesfully answered. The result should be sent
  * in JSON according in the response body.
  * 400: the query failed; body should contain {"error": "my text"} providing extra details
  */
  performQuery(query: string): Promise<InsightResponse>;
  
 /** 
  * List a list of datasets and their types.
  * 
  * @return Promise <InsightResponse>
  * The promise should return an InsightResponse and will only fulfill.
  * The body of this InsightResponse will contain an InsightDataset[]
  * 
  * Return code:
  * 200: The list of added datasets was sucessfully returned.
  */
 listDatasets(): Promise<InsightResponse>;
}
  
