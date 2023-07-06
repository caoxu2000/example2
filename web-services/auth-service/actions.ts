import { loginServiceURL, authLoginEndPoint, requireCredentialEndPoint, isAuthenticatedEndPoint } from '@root/web-services/auth-service/objects'
import request from 'supertest'
import { expect } from 'chai'

/**
* Supertest http get request which sends get http request to the specified endpoint in the server.
* The function will be called in test case
* @param {string} endPointUrl the endpoint to send http get request to
* @returns {request.Test} the http request Test object
*/
export function get (endPointUrl:string): request.Test {
  return request(loginServiceURL).get(endPointUrl)
    .trustLocalhost()
}

/**
* Supertest http post request sends get http request to the specified endpoint in the server.
* The function will be called in test cases
* @param {string} endPointUrl the endpoint to send http get request to
* @returns {request.Test} the http request Test object
*/
export function post (endPointUrl:string): request.Test {
  return request(loginServiceURL).post(endPointUrl).trustLocalhost()
}

/**
* Login function which sends http post request to login endpoint.
* @param {string} username the login username
* @param {string} password the login password
* @returns {request.Test} the http request Test object
*/
export function login ( username: string, password:string ):request.Test {
  return post(authLoginEndPoint)
    .send({ username, password })
}

/**
* Function to make the program stop for centain time to wait the element we need to interact with to be interactable.
* @param {number} ms Millisecond to wait for
*/
export function sleep (ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
* Function to get the expiration information from cookie provided
* @param {string} cookie Cookie string which includes expiration information
*/
export function getExperationInfo (cookie:string):string {
  const expire = cookie.slice(cookie.indexOf('Expires='), cookie.indexOf('GMT;') + 3)
  return expire
}

/**
* Function to get the the time of now and one second later from now
* @returns {Array} Array contains two elements, one of them is the UTC time of now and the other is one second later
*/
export function expirationTime () {
  const now = new Date()
  const onesecLater = new Date()
  now.setHours(now.getHours() + 1)
  onesecLater.setSeconds(onesecLater.getSeconds() + 1)
  const expected_expire = [`Expires=${now.toUTCString()}`, `Expires=${onesecLater.toUTCString()}`]
  return expected_expire
}

export async function checkRedirectGet401 (requestToSend:request.Test, depth = 1) {
  /*
    function execute given request as parameter, it checks the http responses code, if the 302 was received in the response, function calls itself and send a GET
    request to the headers.location from previous call, if the code is 401, then do the 'expect(res.body)' line and return;
    if the code is anything else, then throw an error.
    */
  // if recursive calls happened 10 times but still did not get a response with 401 status, we story the recursive call and throw an error
  if (depth >= 10) {
    throw new Error('Redirect flow is not correct')
  }
  await requestToSend.then(async (res) => {
    // if a response with 302 status was received from post method to login endpoint, execute sending a get method to the response.headers.location, this
    // process will be recursive executed until a response with 401 received
    if (res.status === 302) {
      console.log(res.headers)
      const redirect = res.headers.location
      const new_flow = get(redirect)
      depth = depth + 1
      await checkRedirectGet401(new_flow, depth)
    }
    // if a response with 401 status was received, the redirect flow get the end, check the response body and return
    else if (res.status === 401) {
      expect(res.body).to.eql({ loginStatus: 'failed', token: null })
    }
    // if any statusCode rather than 302 and 401 is received from the post method to login endpoint and get method to
    // the res.header.location from previous post response, function will throw an error to mark the redirect flow is wrong
    else {
      throw new Error('Redirect flow is not correct')
    }
  })
}
