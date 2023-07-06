# Juno Test Framework (JTF)

The following list of conventions are used throughout this repo and are proposed for Juno Integration (Rest API) level tests.

# File Structure
## Naming: Files and directories

* Files: Use lower case with an under-dash as separator.
  * Example: this_is_an_example_file_name.ts
* Folders: Use lower case with a dash as separator
  * Example: this-is-an-example-folder-name

# Coding Styles:
## Naming: Functions and methods

* Camel case defined
  * More information: https://google.github.io/styleguide/jsguide.html#naming-camel-case-defined

## Semicolons are omitted

Javascript performs automatic semicolon insertion which makes the semicolon terminator optional except for a few edge cases that can be avoided.
https://flaviocopes.com/javascript-automatic-semicolon-insertion

Therefore, in any section of this repository, unless absolutely necessary, semicolons will NOT be used

### Edge Case SemiColons
If there is any area of the code where a semicolon is required, a comment above will added describing why the semicolon is neccssary.
Example:
```typescript
// SemiColon required below for edge case due to legacy function requring semicolon
const varable = edgeCaseFunction();
```

## Coding Best Practices:
- Be careful with return statements. If you return something, add it on the same line as the return (same for break, throw, continue)
- Never start a line with parentheses, those might be concatenated with the previous line to form a function call, or array element reference
- Asnychronous Functionality will use the async/await functionality which comes with ES6. No promises or callbacks will be utilized, to help with code readability
- Comments will be on separate lines from code.

```typescript
// This is a comment for the next line of code
codeExecution()
```
  
## Module loading (class vs pure functions)

Prefer import/export of a cohesive set of objects/functions instead of Class definitions.
This allows for import of all, or individual objects and cuts down on instantiating `new` for what is likely a static class.
Private functions are prefixed with underscore `_` Example: _privateFunction()

```typescript
// Import all sub-objects:
import * as procedure from '../pom/procedure.actions'
// then reference with dot notation:
procedure.select()

// OR import individual objects with destructuring:
import { select } as procedure from '../pom/procedure.actions'
select()
```

Class vs Function examples:
* [todo-page.js](https://github.com/giltayar/testautomationu-cypress-course/blob/lesson-8a/cypress/page-objects/todo-page.js) class implementation
* [todo-page.js](https://github.com/giltayar/testautomationu-cypress-course/blob/lesson-8b/cypress/page-objects/todo-page.js) functional implementation

## Function declaration
Prefer [function declaration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function) syntax over anonymous or [function expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function#description) syntax.

- Takes advantage of hoisting so function declaration order does not matter
- Better error logging due to function name being attached vs anonymous or function expression
- More info:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions

```typescript
// functions declaration
export function procedure(procedureName){
    return  request_endpoint({ name: procedureName, exact: true }))
    }
```
OR

```typescript
// functions declaration
function procedure(procedureName){
    return  request_endpoint({ name: procedureName, exact: true }))
    }
// exported as group (aka module)
export { anatomy, surgeon, procedure }

```

## Comments with JSDoc
Use JSDoc comments to describe functions.

- JSDoc comes bundled with VS Code and many JSDoc annotations provide rich IntelliSense
- JSDoc comment snippet comes by typing `/**` above a function
- Optionally use Type information from JSDoc comments to type check your JavaScript
- Hover over a JavaScript symbol to quickly see its type information and relevant documentation
- More info: [vs code + jsdoc ](https://code.visualstudio.com/docs/languages/javascript#_jsdoc-support), https://jsdoc.app

Example JSDoc comment:

```typescript
/**
*  Selects Procedure the procedure from the initial screen after login
* @param {string} anatomyType Cranial, ENT, Spine
* @param {string} surgeonName Default: Standard Profile
* @param {string} procedureName Name of dropdown value
*/

function select({ anatomyType, surgeonName, procedureName }) =>{}}
```

# [xx] Web service Methods
Note: May be replaced by excel spreadsheet
## Structure:
All application services are in the the [`webService/`](/location/) folder and are differentiated by their suffix (`object, action, types, enums`). An index file is present and can be called to have all the service methodology from one location as such:

*Example file structure*:

 * [`/webServices/<service name>`](Example: /webServices/auth-service)
 * [`<page>.object.ts`](./webServices/auth-service/objects.ts) interfaces, end point locations, and required wrapped information responsible for requesting an end point
 * [`<page>.actions.ts`](./end-points/auth-service/actions.ts) files define and aggregate functionality for requesting specific end points such as "Auth Service"
 * [`<page>.enums.ts`](./end-points/auth-service/enums.ts
 * .ts) files define and aggregate a services commonly used definitions and strings in the services api. For example, procedure names, instrument names, tracking view colors etc. 
 * [`<page>.types.ts`](./end-points/auth-service/types.ts) files define and aggregates functionality for strongly typed strings/objects of a given service. This can contain but not limited to strongly typing the services enums and any objects commonly used by the service.
## Methods

- Function methods will send http/https requests to endpoints using the "request" module in the superTest library. They return the request.Test object file, NOT a promise for awaiting the request
  - Example: return request.get('localhost:8085/exams/oid')
  - Incorrect: return await request.get('localhost:8085/exams/oid')

- Function methods will not
  - Have a send value (send values will be in the test case itself)
  - Expect status codes (these will be in the test case itself)

## Documentation

- Per JS docstring standards
- list inputs/outputs and exceptions
- [xx] No examples (see api documentation for examples)

Example:
/**

* Retrieves the warnings for a given exam
* @param {String} examOid Exam oid
* @returns {request.Test} Request response of the endpoint
  */

# Web Service Actions
## Function Abstraction
A service's actions page should utilize common methods found in the common functionalities folder. For instance, an actions page should not reference the SuperTest request() method, instead it shall use the request.ts functionalities in utilities for get, put, post, and delete methodology. Similarly use analogues for any rabbit, or websocket functionality.

## Strong Typed Variable Inputs
Where applicable, variable inputs should be strongly typed to help define what is accepted as an input. For instance, if a function takes a procedure name as an input, here we should limit the import to be a type literal of all possible procedure names instead of just declaring it a string. This will assist in correct function usage in test cases.

# Web Service Objects
## Trailing slashes are always omitted

When *`defining`* a path variable, always leave the trailing slash off. 
This way, *`users of`* the path variable have an expectation of format.

```typescript
// incorrect:
const path = '/path/to/thing/'
// correct:
const path = '/path/to/thing'
```

## Variable Naming
Variable names in objects should be explicit with their ending denoting their use (i.e. URL, endPoint, webSocket)

Example:
workflowTaskEndPoint
workflowTaskWebSocket

# Web Service enums

## Enum Styling

### Variable Name
Shall be in Class camel case (camel case with the first letter capitalized) i.e. MarkerToolColor

### Component Key Names
Shall be in all capitals i.e. GREEN

### Example:
``` typescript
export enum MarkerColors {
    BLUE='blue',
    GREEN='green',
    PURPLE='purple',
    RED='red'
  }
```

## Service Types

# Strongly typed enums
Each enum should have an associated type to go with it. This will help to strongly type inputs to use enums where intended (and congregate commonly used variables to one location if any updates are needed).

Example:
``` typescript
import { MarkerColors } from './enum'

// Assign types from localization service enums
export type markerColor = typeof MarkerColors[keyof typeof MarkerColors]

async function showMarker({marker}:{marker:markerColor})

```

# Test Cases

## Test File structure

- Test case files will be web service dependant (one test file per web service point)
- Methods for that endpoint will be separated by a describe clause

## [xx] Tests shall have a docstring which lists the following:

- Small description of test case
- Step instructions for test
- Expected Results

Example:
``` typescript
/**

* Verify the service endpoint will respond with correct failure message, when an incorrect volume oid is provided
  
  Steps:
  - Send GET to service end point

  Expected Response:
  - Status 500 Response
  - Response body has key "error" with message "Could not find volume"
*/
```
Other example:
## Use GIVEN, WHEN, and THEN to document test case
``` typescript
/**
GIVEN: NA
WHEN:
  - Send GET to service end point
THEN
  - Expected Response:
    - Status 500
    - Body ahs key "error" with message "Could not find volume"
```
## Named parameters
When declaring a function with multiple parameters, prefer passing an anonymous object with named properties instead of positional arguments. This utilizes destructing assignment in function signature is more readable and flexible as described here:
[why-named-arguments-are-better-than-positional](https://blog.bitsrc.io/javascript-why-named-arguments-are-better-than-positional-arguments-).

```typescript
//<webService>.spec.ts
// args `anatomyType` and `procedureName` are required but surgeonName is not
procedure.select({ anatomyType: 'Cranial', procedureName: 'Biopsy' })

//<webService>.action.ts
//The select procedure is a group of "actions". 
//The surgeonName default is handled just before DOM access in the procedure.surgeon() definition.
procedure.select = ({ anatomyType, surgeonName, procedureName }) => {

    procedure.anatomy(anatomyType).click()
    procedure.surgeon(surgeonName).click()
    procedure.procedure(procedureName).click()
}

//<webService>.objects.ts
// Default set here, in the final accessor
procedure.surgeon(surgeonName = 'Standard Profile') {
    return cy.findByRole('button', { name: surgeonName, exact: true })
}

```
## Index usage in test case
In test code, all actions, objects, and enums should be accessed via the index file instead of their individual location. This will help with test case consistency and prevent a large list of individual imports which may look confusing in the test case itself.

Exampe:
import localizationService from '@web-services/localization'

Usage:
localizationService.actions.showTool( { tool: localizationService.enum.passivePlanar })


## Test Assertions
In test cases, assertions will be performed where:
- [xx] Test cases will use the chai assertion library for expect, NOT jest
  - Ensure it is imported in place of expect at the beginning of each test case
- Expect is used for verifying request status
- Then is used to perform the remaining assertions
  - Example:

``` typescript
 request.get(endpoint)
            .expect(200)
            .then( (res) => {
                expect(res.body.name).to.eql(name)
            })
```

## When violating TypeScript checking
Test cases which need to validate incorrect inputs will break type script rules and be flagged as an error. In cases where we need to intentionally violate typescript rules, we shall add a comment // @ts-expect-error above the violiation WITH a description about why this is neccesary

Example:
```typescript
// @ts-expect-error Sending post data method with an empty object to verify error response is returned
postData({})
.expect(404)
```

## Skip Tests in Jest
To skip one or some of the tests in Jest, please update the section on `testPathIgnorePatterns` within `jest.config.ts`

[Jest Doc - testPathIgnorePatterns](https://jestjs.io/docs/configuration#testpathignorepatterns-arraystring)


# Test Data
## test-data folder
The test-data folder will contain all standard and data driven testing information for the repository. Here all request bodies and response verifications can be exported for use in testing

## Data Convention
Testing Data will be stored and exported by a .ts typescript file. This is to ensure we can safely comment these files and add any pertient information without having to be concerned about breaking the file structure.

Example:
```typescript
export const usersProfile:Array<ldapUserProfile> = [
  {
    authtype: 'ldap',
    username: 'taylol21',
    passwd: 'idmpassword',
    roles: ['Admin'],
    privileges: ['changeNetwork', 'changeCart', 'auditLogs']
  }
]
```
## Naming
Variable names should be relevant to what they are testing. For instance, if you are testing user profiles, it would be good to have user profile in the name; the more specific the better.