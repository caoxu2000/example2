import { expect } from 'chai'
import request from 'supertest'
import puppeteer from 'puppeteer'

import { authLoginEndPoint } from '@root/web-services/auth-service/objects'
import { authService } from '@root/web-services/auth-service'
import { ssoCredential } from '@root/test-data/auth-service/sso'

describe('login endpoint for SSO', () => {
  it('test route was redirected and 302 is returned when hit login endpoint for SSO', async () => {
    /**
    * Verify the service login endpoint redirects to idp
    Steps:
    - Send get to auth service login endpoint
    Expected Response:
    - Status: 302
    - Response headers location: "https://login.microsoftonline.com/0a29d274-1367-4a8f-99c5-90c3dc7d4043/saml2"
    */

    await authService.actions
      .get(authLoginEndPoint)
      .expect(302)
      .then((res) => {
        expect(res.headers.location).includes(authService.objects.ssoIdp)
      })
  })
})

describe('test SSO login', () => {
  it('test SSO login with puppeteer', async () => {
    /**
    * Verify the service login endpoint redirects to idp and after successfully logged in, browser is redirected back to callback url,
    * is-authenticated endpoint responds 200 and correct body when going to is-authenticated url and username endpoint responds 200
    * and correct body when going to username url
    Steps:
    - Launch browser
    - Go to login url
    - Login idp with correct username and password, verify page gets back to callback url
    - Go to is-authenticated url, verify api responds 200 and body {loginStatus: 'successful'}
    - Go to username url, verify api responds 200 and body { username: 'bartej7@stgmedtronic.com' }
    -

    */
    const browser = await puppeteer.launch({ headless: false })
    try {
      const page = await browser.newPage()
      await page.goto(authService.objects.loginURL)
      const userSelector = "[name='loginfmt']"
      const passSelector = '[name=passwd]'
      const signInSelector = '[id="idSIButton9"]'
      await page.waitForSelector(userSelector, { visible: true, timeout: 3000 })
      await page.type(userSelector, ssoCredential.username)
      await page.keyboard.press('Enter')
      await page.waitForSelector(passSelector, { visible: true, timeout: 3000 })
      await page.type(passSelector, ssoCredential.password)
      await authService.actions.sleep(2000)
      await page.click(signInSelector)
      const callBackResponse = await page.waitForResponse(
        authService.objects.redirectCallbackURL
      )
      const hearder = await callBackResponse.headers()
      const cookie = hearder['set-cookie']
      const boolValue = authService.actions
        .expirationTime()
        .includes(authService.actions.getExperationInfo(cookie))
      expect(boolValue).to.be.true
      const callBackStatus = await callBackResponse.status()
      const callBackBody = await callBackResponse.json()
      expect(callBackStatus).to.eql(200)
      expect(callBackBody).to.eql({ loginStatus: 'successful' })
      await authService.actions.sleep(2000)
      const authResponse = await page.goto(
        authService.objects.isAuthenticatedURL,
        { waitUntil: 'networkidle0' }
      )
      const authStatus = await authResponse.status()
      const authBody = await authResponse.json()
      expect(authStatus).to.eql(200)
      expect(authBody).to.eql({ authenticated: true })
      const userResponse = await page.goto(authService.objects.userNameURL)
      const userStatus = await userResponse.status()
      const userBody = await userResponse.json()
      expect(userStatus).to.eql(200)
      expect(userBody).to.eql({ username: 'bartej7@stgmedtronic.com' })
    } finally {
      console.log('Closing the browser...')
      await browser.close()
    }
  })
})

describe('test other auth endpoint for sso', () => {
  it('test requires-credentials endpoint', async () => {
    /**
    * Verify the service reqire credentails endpoint responds 200 status and correct body
    Steps:
    - Send get to auth service login fail endpoint
    Expected Response:
    - Status: 200
    - Body: { "requiresCredentials": true }
    */
    await authService.actions
      .get(authService.objects.requireCredentialEndPoint)
      .expect(200)
      .then((res: request.Response) => {
        expect(res.body).to.eql({ requiresCredentials: false })
      })
  })
  it('test login-strategy endpoint', async () => {
    /**
    * Verify the service login-strategy endpoint responds 200 status and correct body
    Steps:
    - Send get to auth service login fail endpoint
    Expected Response:
    - Status: 200
    - Body: {"loginStrategy": "saml"} or {"loginStrategy": "oidc"}
    */
    await authService.actions
      .get(authService.objects.loginStrategyEndPoint)
      .expect(200)
      .then((res) => {
        expect(res.body).to.eql(
          { loginStrategy: 'saml' } || { loginStrategy: 'oidc' }
        )
      })
  })
  it('test requires-credentials endpoint', async () => {
    /**
        * Verify the service reqire credentails endpoint responds 200 status and correct body
        Steps:
        - Send get to auth service login fail endpoint
        Expected Response:
        - Status: 200
        - Body: { "requiresCredentials": true }
        */
    await authService.actions
      .get(authService.objects.requireCredentialEndPoint)
      .expect(200)
      .then((res: request.Response) => {
        expect(res.body).to.eql({ requiresCredentials: false })
      })
  })
})
