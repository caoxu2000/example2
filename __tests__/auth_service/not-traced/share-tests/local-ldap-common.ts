import { expect } from 'chai'
import { authService } from '@webServices/auth-service'
import {
  ldapUserProfile,
  userProfile,
  testLoginDataType
} from '@webServices/auth-service/objects'

export const localAndLdapTests = async (
  testLoginData: testLoginDataType,
  usersProfile: Array<userProfile | ldapUserProfile>,
  strategy: 'local' | 'ldap'
) => {
  describe(`Auth service root - ${strategy}`, () => {
    it('test auth root endpoint return 200 status and correct text', async () => {
      /**
    * Verify the service root endpoint responds with correct status and message, when an get http request is sent
    Steps:
    - Send GET to auth service root endpoint
    Expected Response:
    - Status 200
    - Response body "Auth Service is running"
    */
      await authService.actions
        .get(authService.objects.authEndPoint)
        .expect(200)
        .then((res) => {
          expect(res.text).to.eql('Auth Service is running')
        })
    })

    describe(`Auth service login endpoint - ${strategy}`, () => {
      it('test login failed before authenticated', async () => {
        /**
    * Verify the service login endpoint redirects to login failed route when send get http request to it before authenticated
    Steps:
    - Send GET to service auth service login endpoint
    Expected Response:
    - Status 302
    - Response header location "/auth/login/fail"
    */
        await authService.actions
          .get(authService.objects.authLoginEndPoint)
          .expect(302)
          .then((res) => {
            expect(res.headers.location).to.eql(
              authService.objects.loginFailedEndPoint
            )
          })
      })

      it('test login successful', async () => {
        /**
    * Verify the service login endpoint responds correct status, body and the expiration information
    * in header when send post http request with correct credential
    Steps:
    - Send POST to auth service login endpoint with correct username and password
    Expected Response:
    - Status: 200
    - Body: {loginStatus: 'successful', token: a string}
    - Response header cookie expiration information: session cookie expires one hour later since login successfully
    */
        await authService.actions
          .login({
            username: testLoginData.correctCredential.username,
            password: testLoginData.correctCredential.password
          })
          .expect(200)
          .then((res) => {
            expect(res.body).to.have.keys(['loginStatus', 'token'])
            expect(res.body.loginStatus).to.eql('successful')
          })
      })
      it('test login with wrong credential', async () => {
        // TODO: Test is correct, the app has a bug with data wrongTypeUsername, waiting deve to fix it.
        /**
    * Verify the service login endpoint redirects to login failed route when sending post http request to it with wrong credentials
    * then verify it responds 401 status and body {loginStatus: 'failed', token: null} when send GET to the res.headers.location
    Steps:
    - Send POST to auth service login endpoint with wrong credentials
    - Send GET to the response.headers.location, response is from previous POST method
    Expected Response from POST:
    - Status: 302
    - Response header location "/auth/login/fail"
    Expected Response from GET:
    - Status: 401
    - Response body: {loginStatus: 'failed', token: null}
    */
        const testing_data = [
          testLoginData.correctUserwrongPass,
          testLoginData.wrongTypeUsername,
          testLoginData.wrongTypePassword,
          testLoginData.userWithoutPass,
          testLoginData.noUser,
          testLoginData.emptyData,
          testLoginData.nonExistingUser
        ]
        for (const data of testing_data) {
          const flow = authService.actions.login({
            // @ts-ignore
            username: data.username,
            // @ts-ignore
            password: data.password
          })
          try {
            await authService.actions.checkRedirectGet401(flow)
          } catch (error) {
            // explicitly fail the test when error was caught
            expect(error).to.eql(
              new Error('caught an error, explicitly fail the test`')
            )
          }
        }
      })
    })

    describe(`test login fail endpoint -${strategy}`, () => {
      it('test login fail endpoint get method', async () => {
        /**
    * Verify the service login fail endpoint responds 401 status and correct body
    Steps:
    - Send get to auth service login fail endpoint
    Expected Response:
    - Status: 401
    - Body: { loginStatus: 'failed', token: null }
    */
        await authService.actions
          .get('/auth/login/fail')
          .expect(401)
          .then((res) => {
            expect(res.body).to.eql({ loginStatus: 'failed', token: null })
          })
      })
      it('test login fail endpoint post method', async () => {
        /**
    * Verify the service login fail endpoint responds 401 status and correct body
    Steps:
    - Send post to auth service login fail endpoint
    Expected Response:
    - Status: 401
    - Body: { loginStatus: 'failed' }
    */
        await authService.actions
          .post(authService.objects.loginFailedEndPoint)
          .expect(401)
          .then((res) => {
            expect(res.body).to.eql({ loginStatus: 'failed', token: null })
          })
      })
    })

    describe(`test logout endpoint -${strategy}`, () => {
      // TODO: FIXME: sw will add some checks in the code, will come back to add more tests after then
      it('test logout before login', async () => {
        /**
    * Verify the service logout endpoint responds 200 status and correct body
    Steps:
    - Send get to auth service logout endpoint
    Expected Response:
    - Status: 200
    - Body: { logoutStatus: 'successful' }
    */
        await authService.actions
          .get(authService.objects.logoutEndPoint)
          .expect(200)
          .then((res) => {
            expect(res.body).to.eql({ logoutStatus: 'successful' })
          })
      })
    })

    describe(`test requires-credentials endpoint -${strategy}`, () => {
      it('test requires-credentials', async () => {
        /**
    * Verify the service reqire credentials endpoint responds 200 status and correct body
    Steps:
    - Send get to auth service login fail endpoint
    Expected Response:
    - Status: 200
    - Body: { "requiresCredentials": true }
    */
        await authService.actions
          .get(authService.objects.requireCredentialEndPoint)
          .expect(200)
          .then((res) => {
            expect(res.body).to.eql({ requiresCredentials: true })
          })
      })
    })

    describe(`test login strategy endpoint -${strategy}`, () => {
      it('test login-strategy endpoint return correct login strategy', async () => {
        /**
    * Verify the service login-strategy endpoint responds 200 status and correct body
    Steps:
    - Send get to auth service login fail endpoint
    Expected Response:
    - Status: 200
    - Body: {"loginStrategy": "local"| "ldap"}
    */
        await authService.actions
          .get(authService.objects.loginStrategyEndPoint)
          .expect(200)
          .then((res) => {
            expect(res.body).to.eql({ loginStrategy: strategy })
          })
      })
    })

    describe(`test login endpoints which require login -${strategy}`, () => {
      let Cookie: string
      let token: string
      beforeAll(async () => {
        await authService.actions
          .login({
            username: testLoginData.correctCredential.username,
            password: testLoginData.correctCredential.password
          })
          .then((res) => {
            Cookie = res.headers['set-cookie']
            token = `Bearer ${res.body.token}`
          })
      })

      it('test user is authenticated when sending Cookie and token', async () => {
        /**
    * Verify the service is-authenticated responds 200 and {'authenticated': true} body when sending GET method and sending cookie and token to the endpoint                                                                                                                                                                              endpoint responds 200 status and correct body after set up correct cookie
    Steps:
    - Send GET to is-authenticated endpoint
    Expected Response:
    - Status: 200
    - Body: {'authenticated': true}
    */
        await authService.actions
          .get(authService.objects.isAuthenticatedEndPoint)
          .set('Cookie', Cookie)
          .set('authorization', token)
          .expect(200)
          .then((res) => {
            expect(res.body).to.eql({ authenticated: true })
          })
      })
      it('test user is not authenticated when sending correct Cookie and wrong schema token', async () => {
        /**
       * Verify the service is-authenticated responds 401 and {'authenticated': false} body when sending GET method and sending cookie and wrong schema token to the endpoint                                                                                                                                                                              endpoint responds 200 status and correct body after set up correct cookie
       Steps:
       - Send GET to is-authenticated endpoint with correct cookie and wrong schema token
       Expected Response:
       - Status: 401
       - Body: {'authenticated': false}
       */
        await authService.actions
          .get(authService.objects.isAuthenticatedEndPoint)
          .set('Cookie', Cookie)
          .set('authorization', `token ${token.split(' ')[1]}`)
          .expect(401)
          .then((res) => {
            expect(res.body).to.eql({ authenticated: false })
            expect(
              res.headers['www-authenticate']
                .split(' ')
                .includes('error="invalid_token"')
            ).to.be.true
          })
      })
      it('test user is not authenticated when sending correct Cookie and wrong syntax for bearer token schema', async () => {
        /**
       * Verify the service is-authenticated responds 401 and {'authenticated': false} body when sending GET method and sending cookie and wrong syntax for bearer token schema
       Steps:
       - Send GET to is-authenticated endpoint with correct cookie and wrong syntax for bearer token schema
       Expected Response:
       - Status: 401
       - Body: {'authenticated': false}
       */
        await authService.actions
          .get(authService.objects.isAuthenticatedEndPoint)
          .set('Cookie', Cookie)
          .set('authorization', `token ${token.split(' ')[1]} token`)
          .expect(401)
          .then((res) => {
            expect(res.body).to.eql({ authenticated: false })
            expect(
              res.headers['www-authenticate']
                .split(' ')
                .includes('error="invalid_token"')
            ).to.be.true
          })
      })
      it('test user is not authenticated when sending incorrect Cookie and token', async () => {
        /**
       * Verify the service is-authenticated responds 401 and {'authenticated': false} body when sending GET method and sending cookie and token to the endpoint
       Steps:
       - Send GET to is-authenticated endpoint with sending incorrect Cookie and token
       Expected Response:
       - Status: 401
       - Body: {'authenticated': false}
       */
        await authService.actions
          .get(authService.objects.isAuthenticatedEndPoint)
          .set('Cookie', 'randomstring')
          .set('authorization', 'randometoken')
          .expect(401)
          .then((res) => {
            expect(res.body).to.deep.equal({ authenticated: false })
            expect(
              res.headers['www-authenticate']
                .split(' ')
                .includes('error="invalid_token"')
            ).to.be.true
          })
      })
      it('test user is not authenticated when only sending Cookie but no token', async () => {
        /**
       * Verify the service is-authenticated responds 401 and {'authenticated': false} body when sending GET method with setting cookie but no token to the endpoint
       Steps:
       - Send GET to is-authenticated endpoint
       Expected Response:
       - Status: 401
       - Body: {'authenticated': false}
       */
        await authService.actions
          .get(authService.objects.isAuthenticatedEndPoint)
          .set('Cookie', Cookie)
          .expect(401)
          .then((res) => {
            expect(res.body).to.deep.equal({ authenticated: false })
            expect(
              res.headers['www-authenticate']
                .split(' ')
                .includes('error="invalid_token"')
            ).to.be.true
          })
      })
      it('test user is authenticated when only sending token but not sending cookie', async () => {
        /**
    * Verify the service is-authenticated responds 401 and {'authenticated': false} body when sending GET method with setting token but not cookies to the endpoint
    Steps:
    - Send GET to is-authenticated endpoint
    Expected Response:
    - Status: 401
    - Body: {'authenticated': false}
    - Header['www-authenticate']: 'Bearer error="invalid_token" error_description="invalid session.id"'
    */
        await authService.actions
          .get(authService.objects.isAuthenticatedEndPoint)
          .set('authorization', token)
          .expect(401)
          .then((res) => {
            expect(res.body).to.deep.equal({ authenticated: false })
            expect(
              res.headers['www-authenticate']
                .split(' ')
                .includes('error="invalid_token"')
            ).to.be.true
          })
      })

      it('test user is not authenticated without setting Cookie and token', async () => {
        /**
    * Verify the service is-authenticated endpoint responds 401 status and correct body without setting correct cookie and token
    Steps:
    - Send get to auth service is-authenticatted endpoint without setting cookie and token
    Expected Response:
    - Status: 401
    - Body: {'authenticated': false}
    - Header['www-authenticate']: 'Bearer error="invalid_token" in Header['www-authenticate']
    */
        await authService.actions
          .get(authService.objects.isAuthenticatedEndPoint)
          .expect(401)
          .then((res) => {
            expect(res.body).to.eql({ authenticated: false })
            expect(
              res.headers['www-authenticate']
                .split(' ')
                .includes('error="invalid_token"')
            ).to.be.true
          })
      })
      it('test username endpoint return 200 when setting cookie and token when send get method to it', async () => {
        /**
        * Verify the service username endpoint responds 200 status and correct user information with setting correct cookie and token
        Steps:
        - Send get to auth service username endpoint with setting cookie and token
        Expected Response:
        - Status: 200
        - Body:{'username': "taylol21"}
        */
        await authService.actions
          .get(authService.objects.usernameEndpoint)
          .set('Cookie', Cookie)
          .set('authorization', token)
          .expect(200)
          .then((res) => {
            expect(res.body).to.deep.equal({
              username: testLoginData.correctCredential.username
            })
          })
      })
      it('test username endpoint return 401 when setting incorrect cookie and token when send get method to it', async () => {
        /**
    * Verify the service username endpoint responds 401 status and {'username': null} body with setting incorrect correct cookie and token
    Steps:
    - Send get to auth service username endpoint with setting incorrect cookie and token
    Expected Response:
    - Status: 401
    - Body:{'username': null}
    */
        await authService.actions
          .get(authService.objects.usernameEndpoint)
          .set('Cookie', 'randomcookies1111111')
          .set('authorization', 'randomtoekn11111')
          .expect(401)
          .then((res) => {
            expect(res.body).to.deep.equal({ username: null })
          })
      })
      it('test username endpoint return 401 when only setting cookie but not token when send get method to it', async () => {
        /**
    * Verify the service username endpoint responds 401 status and {'username': null} body with setting correct cookie and not token
    Steps:
    - Send get to auth service username endpoint with setting cookie and not token
    Expected Response:
    - Status: 401
    - Body:{'username': null}
    -  Header['www-authenticate']: 'Bearer error="invalid_token" in Header['www-authenticate']
    */
        await authService.actions
          .get(authService.objects.usernameEndpoint)
          .set('Cookie', Cookie)
          .expect(401)
          .then((res) => {
            expect(res.body).to.deep.equal({ username: null })
            expect(
              res.headers['www-authenticate']
                .split(' ')
                .includes('error="invalid_token"')
            ).to.be.true
          })
      })
      it('test username endpoint return 401 when only setting token but not cookie when send get method to it', async () => {
        /**
    * Verify the service username endpoint responds 401 status and {'username': null} body with setting correct cookie and not token
    Steps:
    - Send get to auth service username endpoint with setting token and not cookie
    Expected Response:
    - Status: 401
    - Body:{'username': null}
    - Header['www-authenticate']: 'Bearer error="invalid_token" in Header['www-authenticate']
    */
        await authService.actions
          .get(authService.objects.usernameEndpoint)
          .set('authorization', token)
          .expect(401)
          .then((res) => {
            expect(res.body).to.eql({ username: null })
            expect(
              res.headers['www-authenticate']
                .split(' ')
                .includes('error="invalid_token"')
            ).to.be.true
          })
      })

      it('test username endpoint return 401 without setting token and cookie when send get method to it', async () => {
        /**
    * Verify the service username endpoint responds 401 status and {'username': null} body without setting  cookie and not token
    Steps:
    - Send get to auth service username endpoint
    Expected Response:
    - Status: 401
    - Body:{'username': null}
    - Header: 'Bearer error="invalid_token" in Header['www-authenticate']
    */
        await authService.actions
          .get(authService.objects.usernameEndpoint)
          .expect(401)
          .then((res) => {
            expect(res.body).to.eql({ username: null })
            expect(
              res.headers['www-authenticate']
                .split(' ')
                .includes('error="invalid_token"')
            ).to.be.true
          })
      })
      it('test keep-alive return 401 before login', async () => {
        /**
    * Verify the service keep-alive endpoint responds 401 status if not authenticated
    Steps:
    - Send get to auth service username endpoint
    Expected Response:
    - Status: 401
    - Text: 'Not authenticated'
    - Header: 'Bearer error="invalid_token" in .headers['www-authenticate']
    */
        await authService.actions
          .get(authService.objects.keepAliveEndPoint)
          .expect(401)
          .then((res) => {
            expect(res.text).to.eql('Not authenticated')
            expect(
              res.headers['www-authenticate']
                .split(' ')
                .includes('error="invalid_token"')
            ).to.be.true
          })
      })
      it('test keep-alive return 200 after successfully login', async () => {
        /**
    * Verify the service username endpoint responds 200 and "keep-alive received" text with setting cookie and token
    * when sending GET to it
    Steps:
    - Send get to auth service is-alive endpoint
    Expected Response:
    - Status: 200
    - Text: 'keep-alive received'
    */
        await authService.actions
          .get(authService.objects.keepAliveEndPoint)
          .set('Cookie', Cookie)
          .set('authorization', token)
          .expect(200)
          .then((res) => {
            expect(res.text).to.eql('keep-alive received')
          })
      })
      it('test keep-alive return 401 with setting incorrect cookie and token when send get method to it', async () => {
        /**
    *Verify keep-alive return 401 with setting incorrect cookie and token when send get method to it
    Steps:
    - Send get to auth service is-alive endpoint with setting incorrect cookie and username
    Expected Response:
    - Status: 401
    - Text: Text: 'Not authenticated'
    - Header: 'Bearer error="invalid_token" in Header['www-authenticate']
    */
        await authService.actions
          .get(authService.objects.keepAliveEndPoint)
          .set('Cookie', 'wrongcookie')
          .set('authorization', 'wrong token')
          .expect(401)
          .then((res) => {
            expect(res.text).to.eql('Not authenticated')
          })
      })
      it('test keep-alive return 401 with setting cookie but not token when sending get to it', async () => {
        /**
    * Verify the service username endpoint responds 401 and "keep-alive received" text with setting cookie but not token
    * when sending GET to it
    Steps:
    - Send get to auth service is-alive endpoint with setting cookie but not token
    Expected Response:
    - Status: 401
    - Text: 'Not authenticated'
    - Header: 'Bearer error="invalid_token" in Header['www-authenticate']
    */
        await authService.actions
          .get(authService.objects.keepAliveEndPoint)
          .set('Cookie', Cookie)
          .expect(401)
          .then((res) => {
            expect(res.text).to.eql('Not authenticated')
            expect(
              res.headers['www-authenticate']
                .split(' ')
                .includes('error="invalid_token"')
            ).to.be.true
          })
      })
      it('test keep-alive return 401 with setting token but not cookie when sending get to it', async () => {
        /**
    * Verify the service username endpoint responds 401 and "Not authenticated" text with setting token but not cookie
    * when sending GET to it
    Steps:
    - Send get to auth service is-alive endpoint with setting token but not cookie
    Expected Response:
    - Status: 401
    - Text: ''Not authenticated'
    - Header: 'Bearer error="invalid_token" in Header['www-authenticate']
    */
        await authService.actions
          .get(authService.objects.keepAliveEndPoint)
          .set('authorization', token)
          .expect(401)
          .then((res) => {
            expect(res.text).to.eql('Not authenticated')
            expect(
              res.headers['www-authenticate']
                .split(' ')
                .includes('error="invalid_token"')
            ).to.be.true
          })
      })
    })

    describe(`test user-profile endpoint -${strategy}`, () => {
      it('test user-profile returns correct user profile after authenticated', async () => {
        // TODO: Create more users on keycloak to impove testing coverage. There is only one invalid user in userProfile
        /**
        * Verify the service user-profile endpoint responds 200 status and correct user information with setting correct cookie with all kinds of users
        Steps:
        - Send get to auth service user-profile endpoint
        Expected Response:
        - Status: 200
        - Body:{ userProfile {
                    contains correct authtype, username, groups, id, roles and privileges
                }}
    */
        for (const profile of usersProfile) {
          await authService.actions
            .login({ username: profile.username, password: profile.passwd })
            .expect(200)
            .then(async (res) => {
              const Cookie = res.headers['set-cookie']
              const token = `Bearer ${res.body.token}`
              const user = JSON.parse(JSON.stringify(profile))
              delete user.passwd
              user.token = token.split(' ')[1]
              await authService.actions
                .get(authService.objects.userProfileEndpoint)
                .set('Cookie', Cookie)
                .set('authorization', token)
                .expect(200)
                .then((res) => {
                  if (strategy === 'ldap') {
                    expect(res.body.userProfile.uid).to.eql(profile.username)
                    expect(res.body.userProfile.privileges).to.eql(
                      profile.privileges
                    )
                    expect(res.body.userProfile.roles).to.eql(profile.roles)
                    expect(res.body.userProfile.authtype).to.eql(
                      profile.authtype
                    )
                  } else {
                    expect(res.body).to.eql({ userProfile: user })
                  }
                })
            })
        }
      })
      it('test user-profile returns 401 with setting incorrect cookie and token when sending get to it', async () => {
        /**
    * Verify user-profile returns 401 with setting incorrect cookie and token when sending get to it
    Steps:
    - Send POST to login Endpoint
    - Send GET to auth service user-profile endpoint with setting incorrect cookie and token got from previous response
    Expected Response:
    - Status: 401
    - Body:{'userProfile': null}
    - Header['www-authenticate']: 'Bearer error="invalid_token" in Header['www-authenticate']
    */
        for (const profile of usersProfile) {
          await authService.actions
            .login({ username: profile.username, password: profile.passwd })
            .then(async (res) => {
              const token = `Bearer ${res.body.token}`
              const user = JSON.parse(JSON.stringify(profile))
              delete user.passwd
              user.token = token.split(' ')[1]
              await authService.actions
                .get(authService.objects.userProfileEndpoint)
                .set('Cookie', 'wrongcookie')
                .set('authorization', 'wrongtoken')
                .expect(401)
                .then((res) => {
                  expect(res.body).to.eql({ userProfile: null })
                })
            })
        }
      })
      it('test user-profile returns 401 without setting cookie and token when sending get to it ', async () => {
        /**
    * Verify the service user-profile endpoint responds 401 status without setting correct cookie and token
    Steps:
    - Send POST to login Endpoint
    - Send GET to auth service user-profile endpoint without setting cookie and token got from previous response
    Expected Response:
    - Status: 401
    - Body:{'userProfile': null}
    - Header['www-authenticate']: 'Bearer error="invalid_token" in Header['www-authenticate']
    */
        for (const userProfile of usersProfile) {
          await authService.actions
            .login({
              username: userProfile.username,
              password: userProfile.passwd
            })
            .then(async (res) => {
              await authService.actions
                .get(authService.objects.userProfileEndpoint)
                .expect(401)
                .then((res) => {
                  expect(res.body).to.eql({ userProfile: null })
                  expect(
                    res.headers['www-authenticate']
                      .split(' ')
                      .includes('error="invalid_token"')
                  ).to.be.true
                })
            })
        }
      })
      it('test user-profile returns 401 with setting cookie but not token when sending get to it', async () => {
        /**
        * Verify the service user-profile endpoint responds 401 status with setting correct cookie but not token
        Steps:
        - Send get to auth service user-profile endpoint with setting cookie but not token
        Expected Response:
        - Status: 401
        - Body:{'userProfile': null}
        - Heade: 'Bearer error="invalid_token" in Header['www-authenticate']
        */
        for (const userProfile of usersProfile) {
          await authService.actions
            .login({
              username: userProfile.username,
              password: userProfile.passwd
            })
            .then(async (res) => {
              const Cookie = res.headers['set-cookie']
              await authService.actions
                .get(authService.objects.userProfileEndpoint)
                .set('Cookie', Cookie)
                .expect(401)
                .then((res) => {
                  expect(res.body).to.eql({ userProfile: null })
                  expect(
                    res.headers['www-authenticate']
                      .split(' ')
                      .includes('error="invalid_token"')
                  ).to.be.true
                })
            })
        }
      })
      it('test user-profile returns 401 with setting token but not cookie when sending get to it', async () => {
        /**
        * Verify the service user-profile endpoint responds 401 status with setting correct token but not cookie
        Steps:
        - Send get to auth service user-profile endpoint with setting token but not cookie
        Expected Response:
        - Status: 401
        - Body:{'userProfile': null}
        - Heade: 'Bearer error="invalid_token" in Header['www-authenticate']
        */
        for (const userProfile of usersProfile) {
          await authService.actions
            .login({
              username: userProfile.username,
              password: userProfile.passwd
            })
            .then(async (res) => {
              const token = `Bearer ${res.body.token}`
              await authService.actions
                .get(authService.objects.userProfileEndpoint)
                .set('autherization', token)
                .expect(401)
                .then((res) => {
                  expect(res.body).to.eql({ userProfile: null })
                  expect(
                    res.headers['www-authenticate']
                      .split(' ')
                      .includes('error="invalid_token"')
                  ).to.be.true
                })
            })
        }
      })
    })
  })
}

export const localAndLdapCookiesTest = (
  testLoginData: testLoginDataType,
  strategy: 'local' | 'ldap'
) => {
  describe(`Test COOKIE expiration- ${strategy}`, () => {
    it('test cookie expiration time within 2 seconds range', async () => {
      /**
* Verify the service login endpoint responds correct status, the expiration information
* in header when send post http request with correct credential
Steps:
- Send POST to auth service login endpoint with correct username and password
Expected Response:
- Status: 200
- Response header cookie expiration information: session cookie expires one hour later since login successfully
*/
      await authService.actions
        .login({
          username: testLoginData.correctCredential.username,
          password: testLoginData.correctCredential.password
        })
        .expect(200)
        .then((res) => {
          const cookie = res.headers['set-cookie'][0]
          // the expirationTIme is an array with contains now and 1 second later from now since sometimes the expiration time is not synced with
          // the time we get from cookie because there could be slightly different between when login happens and when we get response
          const boolValue = authService.actions
            .expirationTime()
            .includes(authService.actions.getExperationInfo(cookie))
          expect(boolValue).to.be.true
        })
    })
  })
}
