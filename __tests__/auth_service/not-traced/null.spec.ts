import { expect } from 'chai'
import { authService } from '@root/web-services/auth-service'
import { testLoginData, usersProfile } from '@testData/auth-service/local'
import { privilegeCheck } from '@testData/auth-service/common'
import { authLoginEndPoint } from '@webServices/auth-service/objects'

describe('Auth service root', () => {
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
})

describe('Auth service login endpoint', () => {
  it('test can login before authenticated', async () => {
    /**
    * Verify the service login endpoint returns 200 and login successful information when sending GET request before user login
    Steps:
    - Send GET to service auth service login endpoint
    Expected Response:
    - Status 200
    - Body { loginStatus: 'successful' }
    */
    await authService.actions
      .get(authService.objects.authLoginEndPoint)
      .expect(200)
      .then((res) => {
        const cookie = res.headers['set-cookie'][0]
        const boolValue = authService.actions
          .expirationTime()
          .includes(authService.actions.getExperationInfo(cookie))
        expect(boolValue).to.be.true
        expect(res.body).to.have.keys(['loginStatus', 'token'])
        expect(res.body.loginStatus).to.eql('successful')
      })
  })

  it('test login successful with correct credential', async () => {
    /**
    * Verify the service login endpoint responds correct status, body and the expiration information
    * in header when send post http request with correct credential
    Steps:
    - Send POST to auth service login endpoint with correct username and password
    Expected Response:
    - Status: 200
    - Body: Has loginStatus, token as key, loginStatus value is successful
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
        expect(res.body).to.have.keys(['loginStatus', 'token'])
        expect(res.body.loginStatus).to.eql('successful')
      })
  })
  it('test login successful with wrong credential', async () => {
    /**
    * Verify the service login endpoint returns 200 and login successful information with wrong credentail
    Steps:
    - Send GET to service auth service login endpoint
    Expected Response:
    - Status 200
    - Body { loginStatus: 'successful' }
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
      // @ts-expect-error Some of input data has wrong types or empty verify endpoint handles correctly
      await authService.actions
        .login({ username: data.username, password: data.password })
        .expect(200)
        .then((res) => {
          expect(res.body).to.have.keys(['loginStatus', 'token'])
          expect(res.body.loginStatus).to.eql('successful')
        })
    }
  })

  it('test login redirect without sending anything', async () => {
    /**
        * Verify the service login endpoint responds 200 when sending post http request to it without sending request body
        Steps:
        - Send POST to auth service login endpoint with wrong format credentials
        Expected Response:
        - Status: 200
        - Body: { loginStatus: 'successful' }
        */

    await authService.actions
      .post(authService.objects.authLoginEndPoint)
      .expect(200)
      .then((res) => {
        expect(res.body).to.have.keys(['loginStatus', 'token'])
        expect(res.body.loginStatus).to.eql('successful')
      })
  })
})

describe('test login fail endpoint', () => {
  it('test login fail endpoint get method', async () => {
    /**
    * Verify the service login fail endpoint responds 401 status and correct body
    Steps:
    - Send get to auth service login fail endpoint
    Expected Response:
    - Status: 401
    - Body: { loginStatus: 'failed' }
    */
    await authService.actions
      .get('/auth/login/fail')
      .expect(401)
      .then((res) => {
        expect(res.body).to.eql({ loginStatus: 'failed', token: null })
      })
  })
})

describe('test logout endpoint', () => {
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

describe('test requires-credentials endpoint', () => {
  it('test requires-credentials', async () => {
    /**
    * Verify the service reqire credentials endpoint responds 200 status and correct body
    Steps:
    - Send get to auth service login fail endpoint
    Expected Response:
    - Status: 200
    - Body: { "requiresCredentials": false }
    */
    await authService.actions
      .get(authService.objects.requireCredentialEndPoint)
      .expect(200)
      .then((res) => {
        expect(res.body).to.eql({ requiresCredentials: false })
      })
  })
})

describe('test login strategy endpoint', () => {
  it('test login-strategy endpoint return correct login strategy', async () => {
    /**
    * Verify the service login-strategy endpoint responds 200 status and correct body
    Steps:
    - Send get to auth service login fail endpoint
    Expected Response:
    - Status: 200
    - Body: {"loginStrategy": "dev"}
    */
    await authService.actions
      .get(authService.objects.loginStrategyEndPoint)
      .expect(200)
      .then((res) => {
        expect(res.body).to.eql({ loginStrategy: 'null' })
      })
  })
})

describe('test isAuthenticated endpoints', () => {
  it('test user is authenticated with setting cookie after hit auth login endpoint with sending valid credential', async () => {
    /**
        * Verify the service is-authenticated endpoint responds 200 status and {'authenticated': true} body with setting correct cookie
        Steps:
           - Send post to auth service login endpoint with sending valid credentails
           - Send get to is-authenticated endpoint with setting session cookie
        Expected Response:
        - Status: 200
        - Body: {'authenticated': true}
        */

    for (const userProfile of usersProfile) {
      await authService.actions
        .login({ username: userProfile.username, password: userProfile.passwd })
        .then(async (res) => {
          await authService.actions
            .get(authService.objects.isAuthenticatedEndPoint)
            .set('Cookie', res.headers['set-cookie'])
            .set('authorization', `Bearer ${res.body.token}`)
            .expect(200)
            .then((res) => {
              expect(res.body).to.eql({ authenticated: true })
            })
        })
    }
  })
  it('test user is authenticated with setting cookie after hit auth login endpoint with sending valid and invalid credential', async () => {
    /**
    * Verify the service is-authenticated endpoint responds 200 status and correct body without setting cookie and token
    Steps:
       - Send post to auth service login endpoint with sending invalid credentails
       - Send get to is-authenticated endpoint with setting session cookie
    Expected Response:
    - Status: 200
    - Body: {'authenticated': true}
    */
    const testing_data = [
      testLoginData.correctCredential,
      testLoginData.correctUserwrongPass,
      testLoginData.wrongTypeUsername,
      testLoginData.wrongTypePassword,
      testLoginData.userWithoutPass,
      testLoginData.noUser,
      testLoginData.emptyData,
      testLoginData.nonExistingUser
    ]
    for (const data of testing_data) {
      // @ts-expect-error Some of input data has wrong types or empty verify endpoint handles correctly
      await authService.actions
        .login({ username: data.username, password: data.password })
        .then(async (res) => {
          await authService.actions
            .get(authService.objects.isAuthenticatedEndPoint)
            .set('Cookie', res.headers['set-cookie'])
            .set('authorization', `Bearer ${res.body.token}`)
            .expect(200)
            .then((res) => {
              expect(res.body).to.deep.equal({ authenticated: true })
            })
        })
    }
  })
  it('test user is not authenticated without setting cookie after hit auth login endpoint with sending invalid data', async () => {
    /**
       * Verify the service is-authenticated endpoint responds 401 status and {'authenticated': false} body after hit auth login endpoint with sending
       * invalid credentials but without setting session cookie
       Steps:
       - Send post to auth service login endpoint
       - Send get to is-authenticated endpoint without setting session cookie
       Expected Response:
       - Status: 401
       - Body: {'authenticated': false}
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
    await authService.actions.post(authLoginEndPoint).then(async (res) => {
      await authService.actions
        .get(authService.objects.isAuthenticatedEndPoint)
        .expect(401)
        .then((res) => {
          expect(res.body).to.deep.equal({ authenticated: false })
        })
    })
  })
})
describe('Test username endpoint', () => {
  it('test username endpoint return 200 with setting cookie after hit auth login endpoint with sending valid credentials', async () => {
    /**
    * Verify the service username endpoint responds 200 status correct user information with setting correct cookie
    Steps:
    - Send post to auth login endpoint with valid credentails
    - Send get to auth service username endpoint with setting cookie
    Expected Response:
    - Status: 200
    - Body: corret user information with format of {"username": "stealth"}
    */
    for (const userProfile of usersProfile) {
      await authService.actions
        .login({ username: userProfile.username, password: userProfile.passwd })
        .then(async (res) => {
          await authService.actions
            .get(authService.objects.usernameEndpoint)
            .set('Cookie', res.headers['set-cookie'])
            .set('authorization', `Bearer ${res.body.token}`)
            .expect(200)
            .then((res) => {
              expect(res.body).to.deep.equal({ username: userProfile.username })
            })
        })
    }
  })
  it('test username endpoint return 401 without setting cookie after hit auth login endpoint with sending valid credentials', async () => {
    /**
        * Verify the service username endpoint responds 200 status correct user information with setting correct cookie
        Steps:
        - Send post to auth login endpoint with valid credentails
        - Send get to auth service username endpoint without setting cookie
        Expected Response:
        - Status: 401
        - Body: corret user information with format of {"username": null}
        */
    for (const userProfile of usersProfile) {
      await authService.actions
        .login({ username: userProfile.username, password: userProfile.passwd })
        .then(async (res) => {
          await authService.actions
            .get(authService.objects.usernameEndpoint)
            .expect(401)
            .then((res) => {
              expect(res.body).to.deep.equal({ username: null })
            })
        })
    }
  })
  it('test username endpoint return 200 with setting cookie after hit auth login endpoint with sending invalid credentials', async () => {
    /**
    * Verify the service username endpoint responds 200 status {"username": "stealth"} body with setting correct cookie
    Steps:
    - Send post to auth login endpoint with invalid credentails
    - Send get to auth service username endpoint with setting cookie
    Expected Response:
    - Status: 200
    - Body: {"username": "stealth"}
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
      // @ts-expect-error Some of input data has wrong types or empty verify endpoint handles correctly
      await authService.actions
        .login({ username: data.username, password: data.password })
        .then(async (res) => {
          await authService.actions
            .get(authService.objects.usernameEndpoint)
            .set('Cookie', res.headers['set-cookie'])
            .set('authorization', `Bearer ${res.body.token}`)
            .expect(200)
            .then((res) => {
              expect(res.body).to.deep.equal({ username: 'stealth' })
            })
        })
    }
  })
  it('test username endpoint return 401 without setting cookie after hit auth login endpoint with sending invalid credentials', async () => {
    /**
    * Verify the service username endpoint responds 401 status {"username": null} body without setting correct cookie
    Steps:
    - Send post to auth login endpoint with invalid credentails
    - Send get to auth service username endpoint without setting cookie
    Expected Response:
    - Status: 401
    - Body: {"username": null}
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
      // @ts-expect-error Some of input data has wrong types or empty verify endpoint handles correctly
      await authService.actions
        .login({ username: data.username, password: data.password })
        .then(async (res) => {
          await authService.actions
            .get(authService.objects.usernameEndpoint)
            .expect(401)
            .then((res) => {
              expect(res.body).to.deep.equal({ username: null })
            })
        })
    }
  })
})
describe('test keep-alive endpoint', () => {
  it('test keep-alive endpoint return 200 with setting cookie after hit auth login endpoint with sending valid credentials', async () => {
    /**
        * Verify the service keep-alive endpoint responds 200 status "keep-alive received" text with setting correct cookie
        Steps:
        - Send post to auth login endpoint with valid credentails
        - Send get to auth service keep-alive endpoint with setting cookie
        Expected Response:
        - Status: 200
        - Text: "keep-alive received"
        */
    for (const userProfile of usersProfile) {
      await authService.actions
        .login({ username: userProfile.username, password: userProfile.passwd })
        .then(async (res) => {
          await authService.actions
            .get(authService.objects.keepAliveEndPoint)
            .set('Cookie', res.headers['set-cookie'])
            .set('authorization', `Bearer ${res.body.token}`)
            .expect(200)
            .then((res) => {
              expect(res.text).to.eql('keep-alive received')
            })
        })
    }
  })
  it('test keep-alive endpoint return 401 without setting cookie after hit auth login endpoint with sending valid credentials', async () => {
    /**
    * Verify the service keep-alive endpoint responds 401 status and "Not authenticated" text without setting correct cookie
    Steps:
    - Send post to auth login endpoint with valid credentails
    - Send get to auth service keep-alive endpoint with setting cookie
    Expected Response:
    - Status: 401
    - Text: "Not authenticated"
    */
    for (const userProfile of usersProfile) {
      await authService.actions
        .login({ username: userProfile.username, password: userProfile.passwd })
        .then(async (res) => {
          await authService.actions
            .get(authService.objects.keepAliveEndPoint)
            .expect(401)
            .then((res) => {
              expect(res.text).to.eql('Not authenticated')
            })
        })
    }
  })
  it('test keep-alive endpoint return 200 with setting cookie after hit auth login endpoint with sending invalid credentials', async () => {
    /**
    * Verify the service keep-alive endpoint responds 200 status "keep-alive received" text with setting correct cookie
    Steps:
    - Send post to auth login endpoint with invalid credentails
    - Send get to auth service keep-alive endpoint with setting cookie
    Expected Response:
    - Status: 200
    - Text: "keep-alive received"
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
      // @ts-expect-error Some of input data has wrong types or empty verify endpoint handles correctly
      await authService.actions
        .login({ username: data.username, password: data.password })
        .then(async (res) => {
          await authService.actions
            .get(authService.objects.keepAliveEndPoint)
            .set('Cookie', res.headers['set-cookie'])
            .set('authorization', `Bearer ${res.body.token}`)
            .expect(200)
            .then((res) => {
              expect(res.text).to.eql('keep-alive received')
            })
        })
    }
  })
  it('test keep-alive endpoint return 401 without setting cookie after hit auth login endpoint with sending invalid credentials', async () => {
    /**
    * Verify the service keep-alive endpoint responds 200 status "keep-alive received" text with setting correct cookie
    Steps:
    - Send post to auth login endpoint with invalid credentails
    - Send get to auth service keep-alive endpoint without setting cookie
    Expected Response:
    - Status: 401
    - Text: "Not authenticated"
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
      // @ts-expect-error Some of input data has wrong types or empty verify endpoint handles correctly
      await authService.actions
        .login({ username: data.username, password: data.password })
        .then(async (res) => {
          await authService.actions
            .get(authService.objects.keepAliveEndPoint)
            .expect(401)
            .then((res) => {
              expect(res.text).to.eql('Not authenticated')
            })
        })
    }
  })
})

describe('test user-profile endpoint', () => {
  it('test user-profile endpoint return 200 with setting cookie after hit auth login endpoint with sending valid credentials', async () => {
    /**
    * Verify the service user-profile endpoint responds 200 status and correct user profile information with setting correct cookie with all kinds of users
    Steps:
    - Send post to auth service login endpoint with sending valid credentails
    - Send get to auth service user-profile endpoint with setting cookie
    Expected Response:
    - Status: 200
    - Body:{ userProfile {
                contains correct authtype, username, groups, id, roles, privileges and token
            }}
    */

    for (const userProfile of usersProfile) {
      await authService.actions
        .login({ username: userProfile.username, password: userProfile.passwd })
        .expect(200)
        .then(async (res) => {
          const token = `Bearer ${res.body.token}`
          userProfile.authtype = 'null'
          // @ts-expect-error need to delete password for userprofile check
          delete userProfile.passwd
          userProfile.token = token.split(' ')[1]

          await authService.actions
            .get(authService.objects.userProfileEndpoint)
            .set('Cookie', res.headers['set-cookie'])
            .set('authorization', token)
            .expect(200)
            .then((res) => {
              expect(res.body).to.eql({ userProfile })
            })
        })
    }
  })
  it('test user-profile endpoint return 401 with setting cookie after hit auth login endpoint with sending valid credentials', async () => {
    /**
    * Verify the service user-profile endpoint responds 401 status and { userProfile: null } body with setting correct cookie with all kinds of users
    Steps:
    - Send post to auth service login endpoint with sending valid credentails
    - Send get to auth service user-profile endpoint without setting cookie
    Expected Response:
    - Status: 401
    - Body:{ userProfile: null}
    */
    for (const userProfile of usersProfile) {
      await authService.actions
        .login({ username: userProfile.username, password: userProfile.passwd })
        .then(async (res) => {
          await authService.actions
            .get(authService.objects.userProfileEndpoint)
            .expect(401)
            .then((res) => {
              expect(res.body).to.eql({ userProfile: null })
            })
        })
    }
  })
  it('test user-profile endpoint return 200 with setting cookie after hit auth login endpoint with sending invalid credentials', async () => {
    /**
    * Verify user-profile endpoint return 200 with setting cookie after hit auth login endpoint with sending invalid credentials
    Steps:
    - Send post to auth service login endpoint with sending valid credentails
    - Send get to auth service user-profile endpoint with setting cookie
    Expected Response:
    - Status: 200
    - Body:{ userProfile {
                contains correct authtype, username, groups, id, roles and privileges
            }}
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
      // @ts-expect-error Some of input data has wrong types or empty verify endpoint handles correctly
      await authService.actions
        .login({ username: data.username, password: data.passwd })
        .expect(200)
        .then(async (res) => {
          const token = res.body.token
          await authService.actions
            .get(authService.objects.userProfileEndpoint)
            .set('Cookie', res.headers['set-cookie'])
            .set('authorization', `Bearer ${token}`)
            .expect(200)
            .then((res) => {
              expect(res.body).to.eql({
                userProfile: {
                  authtype: 'null',
                  groups: ['local_group_surgeon'],
                  id: 2000,
                  privileges: ['viewPHI', 'plan', 'navigate'],
                  roles: ['Surgeon'],
                  username: 'stealth',
                  token: token
                }
              })
            })
        })
    }
  })
  it('test user-profile endpoint return 401 without setting cookie after hit auth login endpoint with sending invalid credentials', async () => {
    /**
    * Verify the service user-profile endpoint responds 401 status and { userProfile: null } body with setting correct cookie with all kinds of users
    Steps:
    - Send post to auth service login endpoint with sending valid credentails
    - Send get to auth service user-profile endpoint without setting cookie
    Expected Response:
    - Status: 401
    - Body:{ userProfile: null}
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
      // @ts-expect-error Some of input data has wrong types or empty verify endpoint handles correctly
      await authService.actions
        .login({ username: data.username, password: data.passwd })
        .then(async (res) => {
          await authService.actions
            .get(authService.objects.userProfileEndpoint)
            .expect(401)
            .then((res) => {
              expect(res.body).to.eql({ userProfile: null })
            })
        })
    }
  })
})
describe('test gate-check static', () => {
  it('test user has access to the gates which stealth user has with correct session cookie set up after hit login endpoint with sending invalid credentials', async () => {
    /**
    * Verify the service gate-check-static endpoint responds 403 status and "Not authorized" text with correct and incorrect credientials with setting cookies and 'X-Original-URI' which includes privileges
    *  stealth user doesn't have and 'X-Original-Method'=GET
    Steps:
    - Send Post to login endpoint with valid and invalid credentials
    - Send get to auth service gate-check-static endpoint with 'X-Original-URI' including privileges that stealth user does not have and 'X-Original-Method'=GET specified
    Expected Response:
    - Status: 403
    - Text:"Not authorized"
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
    const privilegesStealthNotHave = privilegeCheck.filter(
      (gate) => !gate.usersHaveAccess.includes('stealth')
    )
    for (const privilegeTable of privilegesStealthNotHave) {
      for (const data of testing_data) {
        const URIpath =
          authService.objects.loginServiceURL + privilegeTable.path
        // @ts-expect-error Some of input data has wrong types or empty verify endpoint handles correctly
        await authService.actions
          .login({ username: data.username, password: data.passwd })
          .then(async (res) => {
            const Cookie = res.headers['set-cookie']
            await authService.actions
              .get(authService.objects.gateCheckStaticEndpoint)
              .set({ 'X-Original-URI': URIpath, 'X-Original-Method': 'GET' })
              .set('Cookie', Cookie)
              .expect(403)
              .then((res) => {
                expect(res.text).to.eql('Not authorized')
              })
          })
      }
    }
  })
  it('test user has access to the gates which stealth user has with correct session cookie set up after hit login endpoint with sending invalid credentials', async () => {
    /**
    * Verify the service gate-check-static endpoint responds 200 status and "Allow" text with correct and incorrect credientials with setting cookies and 'X-Original-URI' which includes privileges
    *  stealth user has and 'X-Original-Method'=GET
    Steps:
    - Send Post to login endpoint with valid and invalid credentials
    - Send get to auth service gate-check-static endpoint with 'X-Original-URI' including privileges that stealth user has and 'X-Original-Method'=GET specified
    Expected Response:
    - Status: 200
    - Text:"Allow"
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
    const privilegesStealthHas = privilegeCheck.filter((gate) =>
      gate.usersHaveAccess.includes('stealth')
    )
    for (const privilegeTable of privilegesStealthHas) {
      for (const data of testing_data) {
        const URIpath =
          authService.objects.loginServiceURL + privilegeTable.path
        // @ts-expect-error Some of input data has wrong types or empty verify endpoint handles correctly
        await authService.actions
          .login({ username: data.username, password: data.passwd })
          .then(async (res) => {
            const Cookie = res.headers['set-cookie']
            await authService.actions
              .get(authService.objects.gateCheckStaticEndpoint)
              .set({ 'X-Original-URI': URIpath, 'X-Original-Method': 'GET' })
              .set('Cookie', Cookie)
              .expect(200)
              .then((res) => {
                expect(res.text).to.eql('Allow')
              })
          })
      }
    }
  })
})

describe('test gate-check-api', () => {
  it('test user has access to the gates which stealth user has with correct session cookie set up after hit login endpoint with sending invalid credentials', async () => {
    /**
    * Verify the service gate-check-api endpoint responds 200 status and "Allow" text with correct and incorrect credientials with setting cookies and 'X-Original-URI' which includes privileges
    *  stealth user doesn't have and 'X-Original-Method'=GET
    Steps:
    - Send Post to login endpoint with valid and invalid credentials
    - Send get to auth service gate-check-static endpoint with 'X-Original-URI' including privileges that stealth user does not have and 'X-Original-Method'=GET specified
    Expected Response:
    - Status: 200
    - Text:"Allow"
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
    const privilegesStealthNotHave = privilegeCheck.filter(
      (gate) => !gate.usersHaveAccess.includes('stealth')
    )
    for (const privilegeTable of privilegesStealthNotHave) {
      for (const data of testing_data) {
        const URIpath =
          authService.objects.loginServiceURL + privilegeTable.path
        // @ts-expect-error Some of input data has wrong types or empty verify endpoint handles correctly
        await authService.actions
          .login({ username: data.username, password: data.passwd })
          .then(async (res) => {
            const Cookie = res.headers['set-cookie']
            await authService.actions
              .get(authService.objects.gateCheckApiEndpoint)
              .set({ 'X-Original-URI': URIpath, 'X-Original-Method': 'GET' })
              .set('Cookie', Cookie)
              .set('authorization', `Bearer ${res.body.token}`)
              .expect(403)
              .then((res) => {
                expect(res.text).to.eql('Not authorized')
              })
          })
      }
    }
  })
  it('test user has access to the gates which stealth user has with correct session cookie set up after hit login endpoint with sending invalid credentials', async () => {
    /**
    * Verify the service gate-check-static endpoint responds 200 status and "Allow" text with correct and incorrect credientials with setting cookies and 'X-Original-URI' which includes privileges
    *  stealth user has and 'X-Original-Method'=GET
    Steps:
    - Send Post to login endpoint with valid and invalid credentials
    - Send get to auth service gate-check-static endpoint with 'X-Original-URI' including privileges that stealth user has and 'X-Original-Method'=GET specified
    Expected Response:
    - Status: 200
    - Text:"Allow"
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
    const privilegesStealthHas = privilegeCheck.filter((gate) =>
      gate.usersHaveAccess.includes('stealth')
    )
    for (const privilegeTable of privilegesStealthHas) {
      for (const data of testing_data) {
        const URIpath =
          authService.objects.loginServiceURL + privilegeTable.path
        // @ts-expect-error Some of input data has wrong types or empty verify endpoint handles correctly
        await authService.actions
          .login({ username: data.username, password: data.passwd })
          .then(async (res) => {
            const Cookie = res.headers['set-cookie']
            await authService.actions
              .get(authService.objects.gateCheckApiEndpoint)
              .set({ 'X-Original-URI': URIpath, 'X-Original-Method': 'GET' })
              .set('Cookie', Cookie)
              .set('authorization', `Bearer ${res.body.token}`)
              .expect(200)
              .then((res) => {
                expect(res.text).to.eql('Allow')
              })
          })
      }
    }
  })
})
