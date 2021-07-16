## Dataset 

A **valid** dataset: 
- Has to be a valid zip file. 
- Valid data will always be in CSV or XML formats.

### Response codes

```
* 204: the operation was successful
* 400: the operation failed. The body should contain {"error": "my text"}
addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<InsightResponse>;

* 204: the operation was successful.
* 404: the operation was unsuccessful because the delete was for a resource that
* was not previously added.
removeDataset(id: string): Promise<InsightResponse>;

* 200: the query was successfully answered. The result should be sent in JSON according in the response body.
* 400: the query failed; body should contain {"error": "my text"} providing extra detail.
performQuery(query: any): Promise<InsightResponse>;

* 200: The list of added datasets was sucessfully returned.                            
listDatasets(): Promise<InsightResponse>;
```
### Tokenization

#### Parsing tokens from query example:

```
In courses dataset courses, find entries whose Average is greater than 97; show Department and Average; sort in ascending order by Average.
```
#### Result:
```
[
  {
    type: 'DATASET',
    value: [ [Object], [Object], [Object], [Object] ]
  },
  { type: 'FILTER', value: [ [Object] ] },
  { type: 'DISPLAY', value: [ [Object], [Object] ] },
  { type: 'ORDER', value: [ [Object] ] }
]
```

## Query Engine

The query based on the EBNF described below.

### EBNF

*Note: this [EBNF](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_Form) is not complete and will be extended in future deliverables*
```
QUERY   ::= DATASET + ', ' + FILTER + '; ' + DISPLAY(+ '; ' + ORDER)? + '.'
DATASET ::= 'In ' + KIND + ' dataset ' + INPUT
FILTER  ::= 'find all entries' || 'find entries whose ' + (CRITERIA || (CRITERIA + ((' and ' || ' or ') + CRITERIA)*)
DISPLAY ::= 'show ' + KEY (+ MORE_KEYS)?
ORDER   ::= 'sort in ascending order by ' + KEY

CRITERIA   ::= M_CRITERIA || S_CRITERIA
M_CRITERIA ::= M_KEY + M_OP + NUMBER
S_CRITERIA ::= S_KEY + S_OP + STRING

NUMBER   ::= ('-')? + [0-9] (+ [0-9])* + ('.' + [0-9] (+ [0-9])*)?
STRING   ::= '"' + [^*"]* + '"' // any string without * or " in it, enclosed by double quotation marks

RESERVED ::= KEYWORD || M_OP || S_OP
KEYWORD  ::= 'In' || 'dataset' || 'find' || 'all' || 'show' || 'and' || 'or' || 'sort' || 'by' || 'entries' || 'is' || 'the' || 'of' || 'whose'
M_OP     ::= 'is ' + ('not ' +)? ('greater than ' || 'less than ' || 'equal to ')
S_OP     ::= ('is ' (+ 'not ')?) || 'includes ' || 'does not include ' || (('begins' || 'does not begin' || 'ends' || 'does not end') + ' with ')

KIND     ::= 'courses'

INPUT    ::= string of one or more characters. Cannot contain spaces, underscores or equal to RESERVED strings

KEY   ::= M_KEY || S_KEY
MORE_KEYS   ::= ((', ' + KEY +)* ' and ' + KEY)
M_KEY ::= 'Average' || 'Pass' || 'Fail' || 'Audit'
S_KEY ::= 'Department' || 'ID' || 'Instructor' || 'Title' || 'UUID'
```
### Query Example

##### Simple query
```
In courses dataset courses, find entries whose Average is greater than 97; show Department and Average; sort in ascending order by Average.
```

Result:

```
{ result:
   [ { courses_dept: 'epse', courses_avg: 97.09 },
     { courses_dept: 'math', courses_avg: 97.09 },
     { courses_dept: 'math', courses_avg: 97.09 },
     { courses_dept: 'epse', courses_avg: 97.09 },
     { courses_dept: 'math', courses_avg: 97.25 },
     { courses_dept: 'math', courses_avg: 97.25 },
     { courses_dept: 'epse', courses_avg: 97.29 },
     { courses_dept: 'epse', courses_avg: 97.29 },
     { courses_dept: 'nurs', courses_avg: 97.33 },
     { courses_dept: 'nurs', courses_avg: 97.33 },
     { courses_dept: 'epse', courses_avg: 97.41 },
     { courses_dept: 'epse', courses_avg: 97.41 },
     { courses_dept: 'cnps', courses_avg: 97.47 },
     { courses_dept: 'cnps', courses_avg: 97.47 },
     { courses_dept: 'math', courses_avg: 97.48 },
     { courses_dept: 'math', courses_avg: 97.48 },
     { courses_dept: 'educ', courses_avg: 97.5 },
     { courses_dept: 'nurs', courses_avg: 97.53 },
     { courses_dept: 'nurs', courses_avg: 97.53 },
     { courses_dept: 'epse', courses_avg: 97.67 },
     { courses_dept: 'epse', courses_avg: 97.69 },
     { courses_dept: 'epse', courses_avg: 97.78 },
     { courses_dept: 'crwr', courses_avg: 98 },
     { courses_dept: 'crwr', courses_avg: 98 },
     { courses_dept: 'epse', courses_avg: 98.08 },
     { courses_dept: 'nurs', courses_avg: 98.21 },
     { courses_dept: 'nurs', courses_avg: 98.21 },
     { courses_dept: 'epse', courses_avg: 98.36 },
     { courses_dept: 'epse', courses_avg: 98.45 },
     { courses_dept: 'epse', courses_avg: 98.45 },
     { courses_dept: 'nurs', courses_avg: 98.5 },
     { courses_dept: 'nurs', courses_avg: 98.5 },
     { courses_dept: 'epse', courses_avg: 98.58 },
     { courses_dept: 'nurs', courses_avg: 98.58 },
     { courses_dept: 'nurs', courses_avg: 98.58 },
     { courses_dept: 'epse', courses_avg: 98.58 },
     { courses_dept: 'epse', courses_avg: 98.7 },
     { courses_dept: 'nurs', courses_avg: 98.71 },
     { courses_dept: 'nurs', courses_avg: 98.71 },
     { courses_dept: 'eece', courses_avg: 98.75 },
     { courses_dept: 'eece', courses_avg: 98.75 },
     { courses_dept: 'epse', courses_avg: 98.76 },
     { courses_dept: 'epse', courses_avg: 98.76 },
     { courses_dept: 'epse', courses_avg: 98.8 },
     { courses_dept: 'spph', courses_avg: 98.98 },
     { courses_dept: 'spph', courses_avg: 98.98 },
     { courses_dept: 'cnps', courses_avg: 99.19 },
     { courses_dept: 'math', courses_avg: 99.78 },
     { courses_dept: 'math', courses_avg: 99.78 } ] }
```

##### Complex query
```
In courses dataset courses, find entries whose Average is greater than 90 and Department is \"adhe\" or Average is equal to 95; show Department, ID and Average; sort in ascending order by Average.
```

The result of this query would be:

```
{ result:
   [ { courses_dept: 'adhe', courses_id: '329', courses_avg: 90.02 },
     { courses_dept: 'adhe', courses_id: '412', courses_avg: 90.16 },
     { courses_dept: 'adhe', courses_id: '330', courses_avg: 90.17 },
     { courses_dept: 'adhe', courses_id: '412', courses_avg: 90.18 },
     { courses_dept: 'adhe', courses_id: '330', courses_avg: 90.5 },
     { courses_dept: 'adhe', courses_id: '330', courses_avg: 90.72 },
     { courses_dept: 'adhe', courses_id: '329', courses_avg: 90.82 },
     { courses_dept: 'adhe', courses_id: '330', courses_avg: 90.85 },
     { courses_dept: 'adhe', courses_id: '330', courses_avg: 91.29 },
     { courses_dept: 'adhe', courses_id: '330', courses_avg: 91.33 },
     { courses_dept: 'adhe', courses_id: '330', courses_avg: 91.33 },
     { courses_dept: 'adhe', courses_id: '330', courses_avg: 91.48 },
     { courses_dept: 'adhe', courses_id: '329', courses_avg: 92.54 },
     { courses_dept: 'adhe', courses_id: '329', courses_avg: 93.33 },
     { courses_dept: 'rhsc', courses_id: '501', courses_avg: 95 },
     { courses_dept: 'bmeg', courses_id: '597', courses_avg: 95 },
     { courses_dept: 'bmeg', courses_id: '597', courses_avg: 95 },
     { courses_dept: 'cnps', courses_id: '535', courses_avg: 95 },
     { courses_dept: 'cnps', courses_id: '535', courses_avg: 95 },
     { courses_dept: 'cpsc', courses_id: '589', courses_avg: 95 },
     { courses_dept: 'cpsc', courses_id: '589', courses_avg: 95 },
     { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
     { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
     { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
     { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
     { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
     { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
     { courses_dept: 'crwr', courses_id: '599', courses_avg: 95 },
     { courses_dept: 'sowk', courses_id: '570', courses_avg: 95 },
     { courses_dept: 'econ', courses_id: '516', courses_avg: 95 },
     { courses_dept: 'edcp', courses_id: '473', courses_avg: 95 },
     { courses_dept: 'edcp', courses_id: '473', courses_avg: 95 },
     { courses_dept: 'epse', courses_id: '606', courses_avg: 95 },
     { courses_dept: 'epse', courses_id: '682', courses_avg: 95 },
     { courses_dept: 'epse', courses_id: '682', courses_avg: 95 },
     { courses_dept: 'kin', courses_id: '499', courses_avg: 95 },
     { courses_dept: 'kin', courses_id: '500', courses_avg: 95 },
     { courses_dept: 'kin', courses_id: '500', courses_avg: 95 },
     { courses_dept: 'math', courses_id: '532', courses_avg: 95 },
     { courses_dept: 'math', courses_id: '532', courses_avg: 95 },
     { courses_dept: 'mtrl', courses_id: '564', courses_avg: 95 },
     { courses_dept: 'mtrl', courses_id: '564', courses_avg: 95 },
     { courses_dept: 'mtrl', courses_id: '599', courses_avg: 95 },
     { courses_dept: 'musc', courses_id: '553', courses_avg: 95 },
     { courses_dept: 'musc', courses_id: '553', courses_avg: 95 },
     { courses_dept: 'musc', courses_id: '553', courses_avg: 95 },
     { courses_dept: 'musc', courses_id: '553', courses_avg: 95 },
     { courses_dept: 'musc', courses_id: '553', courses_avg: 95 },
     { courses_dept: 'musc', courses_id: '553', courses_avg: 95 },
     { courses_dept: 'nurs', courses_id: '424', courses_avg: 95 },
     { courses_dept: 'nurs', courses_id: '424', courses_avg: 95 },
     { courses_dept: 'obst', courses_id: '549', courses_avg: 95 },
     { courses_dept: 'psyc', courses_id: '501', courses_avg: 95 },
     { courses_dept: 'psyc', courses_id: '501', courses_avg: 95 },
     { courses_dept: 'econ', courses_id: '516', courses_avg: 95 },
     { courses_dept: 'adhe', courses_id: '329', courses_avg: 96.11 } ] }
```
