/**
File: request.ts
Author: Medtronic
Description:  This file contains functions used to interact with the Rest API implementations of server endpoints

**/

import request from 'supertest'

/**
* Sends Supertest http get request to the specified endpoint in the server.
* The function will be called in test case
* @param {string} serviceUrl the url of the system under test
* @param {string} endPointUrl the endpoint to send http request to
* @returns {request.Test} the http request Test object
*/
export function get ( serviceUrl:string, endPointUrl:string, cookie:string='', token:string='' ): request.Test {
  return request(serviceUrl).get(endPointUrl).trustLocalhost()
    .set('Cookie', cookie)
    .set('authorization', token)
}

/**
* Sends Supertest http post request to the specified endpoint in the server.
* The function will be called in test cases
* @param {string} serviceUrl the url of the system under test
* @param {string} endPointUrl the endpoint to send http request to
* @returns {request.Test} the http request Test object
*/
export function post ( serviceUrl:string, endPointUrl:string, cookie:string='', token:string='' ): request.Test {
  return request(serviceUrl).post(endPointUrl).trustLocalhost()
    .set('Cookie', cookie)
    .set('authorization', token)
}
/**
* Sends Supertest http put request to the specified endpoint in the server.
* The function will be called in test cases
* @param {string} serviceUrl the url of the system under test
* @param {string} endPointUrl the endpoint to send httprequest to
* @returns {request.Test} the http request Test object
*/
export function put ( serviceUrl:string, endPointUrl:string, cookie:string='', token:string='' ): request.Test {
  return request(serviceUrl).put(endPointUrl).trustLocalhost()
    .set('Cookie', cookie )
    .set('authorization', token )
}

/**
* Sends Supertest http delete request to the specified endpoint in the server.
* The function will be called in test cases
* @param {string} serviceUrl the url of the system under test
* @param {string} endPointUrl the endpoint to send http request to
* @returns {request.Test} the http request Test object
*/
export function remove ( serviceUrl:string, endPointUrl:string, cookie:string='', token:string='' ): request.Test {
  return request(serviceUrl).delete(endPointUrl).trustLocalhost()
    .set('Cookie', cookie)
    .set('authorization', token)
}

/**
 * Helper method to dynamically generate each EndPoint to request
 * @param {String} template endpoint template string
 * @param {String} value value to substitute in template
 * @param {String} param parameter in template to replace with the value
 * @returns {String} Completed EndPoint for the current exam
 * @throws {Error} If param not found in template
 */
export function generateEndPoint ({ template, value, param }:{template:string, value:string, param:string}): string {
  let endPoint:string
  if (template.includes(param)) {
    endPoint = template.replace(param, value)
  } else {
    throw Error(`Could not generate endpoint, param: ${param} not found in template: ${template}`)
  }
  return endPoint
}
