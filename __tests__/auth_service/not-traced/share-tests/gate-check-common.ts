import { expect } from 'chai'

import { authService } from '@webServices/auth-service'
import {
  ldapUserProfile,
  userProfile,
  testLoginDataType,
  privilegeCheck
} from '@root/web-services/auth-service/objects'

export const gateCheck = (
  testLoginData: testLoginDataType,
  usersProfile: Array<userProfile | ldapUserProfile>,
  privilegeCheck: Array<privilegeCheck>,
  strategy: 'local' | 'ldap'
) => {
  describe(`test gate-check-static -${strategy}`, () => {
    let Cookie: string
    beforeAll(async () => {
      await authService.actions
        .login({
          username: testLoginData.correctCredential.username,
          password: testLoginData.correctCredential.password
        })
        .then((res) => {
          Cookie = res.headers['set-cookie']
        })
    })
    it('test gate-check returns 401 if not authenticated ', async () => {
      /**
    * Verify the service gate-check endpoint responds 401 status without setting correct cookie
    Steps:
    - Send get to auth service gate-check endpoint
    Expected Response:
    - Status: 401
    - Text:"Not authenticated"
    */
      await authService.actions
        .get(authService.objects.gateCheckStaticEndpoint)
        .expect(401)
        .then((res) => {
          expect(res.text).to.eql('Not authenticated')
        })
    })
    it('test gate-check returns 403 if user is authenticated but not authorized', async () => {
      /**
    * Verify the service gate-check endpoint responds 403 status with setting correct cookie but no "X-Original-URI" header specified at all
    Steps:
    - Send get to auth service gate-check endpoint
    Expected Response:
    - Status: 403
    - Text:"Not authorized"
    */
      await authService.actions
        .get(authService.objects.gateCheckStaticEndpoint)
        .set('Cookie', Cookie)
        .expect(403)
        .then((res) => {
          expect(res.text).to.eql('Not authorized')
        })
    })

    it('test all users have access to the gate which has ANY as requires', async () => {
      /**
    * Verify the service gate-check endpoint whoes requires is "ANY" responds 200 status and "Allow" text with all users with setting cookies and users corresponding 'X-Original-URI' and 'X-Original-Method' value
    Steps:
    - Send get to auth service gate-check endpoint whoes requires is "ANY" with cookie, 'X-Original-URI' and 'X-Original-Method' specified
    Expected Response:
    - Status: 200
    - Text:"Allow"
    */
      const anyPrivilegeTable = privilegeCheck.filter((table) =>
        table.requires.flat().includes('ANY')
      )
      for (const profile of usersProfile) {
        const URIpath =
          authService.objects.loginServiceURL + anyPrivilegeTable[0].path
        await authService.actions
          .login({ username: profile.username, password: profile.passwd })
          // .expect(200)
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
    })
    it('test all users have no access to the gate which has FORBIDDEN as requires', async () => {
      /**
    * Verify the service gate-check endpoint whose requires is 'FORBIDDEN' responds 403 status and "Not authorized" text with all users with setting cookies and users corresponding 'X-Original-URI' and 'X-Original-Method' value
    Steps:
    - Send get to auth service gate-check endpoint whose requires is 'FORBIDDEN' with cookie, 'X-Original-URI' and 'X-Original-Method' specified
    Expected Response:
    - Status: 403
    - Text:"Not authorized"
    */
      const forbiddenPrivilegeTable = privilegeCheck.filter((table) =>
        table.requires.flat().includes('FORBIDDEN')
      )
      for (const userProfile of usersProfile) {
        const URIpath =
          authService.objects.loginServiceURL + forbiddenPrivilegeTable[0].path
        await authService.actions
          .login({
            username: userProfile.username,
            password: userProfile.passwd
          })
          .expect(200)
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
    })
    it('test all users have access to the gate responds 200 status and Allow', async () => {
      /**
    * Verify the service gate-check endpoint responds 200 status and Allow text with all users who have access to the gate with setting cookies and users corresponding 'X-Original-URI' and 'X-Original-Method' value
    Steps:
    - Send get to auth service gate-check endpoint with cookie, 'X-Original-URI' and 'X-Original-Method' specified
    Expected Response:
    - Status: 200
    - Text:"Allow"
    */
      for (const privilegeTable of privilegeCheck) {
        const usersHavePrivilege = usersProfile.filter((user) => {
          return privilegeTable.rolesHaveAccess.some((role) => {
            return role === user.roles
          })
        })
        for (const user of usersHavePrivilege) {
          const URIpath =
            authService.objects.loginServiceURL +
            privilegeTable.path +
            '&bearertoken='
          await authService.actions
            .login({ username: user.username, password: user.passwd })
            .expect(200)
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
    it('test all users have no access to the gate responds 403 and Not authorized', async () => {
      /**
    * Verify the service gate-check endpoint responds 403 status and Not authorized text with all users who have no access to the gate with setting cookies and users corresponding 'X-Original-URI' and 'X-Original-Method' value
    Steps:
    - Send get to auth service gate-check endpoint with cookie, 'X-Original-URI' and 'X-Original-Method' specified
    Expected Response:
    - Status: 403
    - Text: "Not authorized"
    */
      for (const privilegeTable of privilegeCheck) {
        const usersHavePrivilege = usersProfile.filter((user) => {
          return privilegeTable.rolesHaveAccess.every((role) => {
            return (
              role !== user.roles && privilegeTable.requires.includes(['ANY'])
            )
          })
        })
        for (const user of usersHavePrivilege) {
          const URIpath =
            authService.objects.loginServiceURL + privilegeTable.path
          await authService.actions
            .login({ username: user.username, password: user.passwd })
            .expect(200)
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
  })

  describe(`test gate-check-api -${strategy}`, () => {
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
          token = res.body.token
        })
    })
    it('test gate-check returns 401 without setting cookie and token ', async () => {
      /**
    * Verify the service gate-check endpoint responds 401 status without setting correct cookie
    Steps:
    - Send get to auth service gate-check endpoint
    Expected Response:
    - Status: 401
    - Text:"Not authenticated"
    - Headers: 'Bearer error="invalid_token" in Headers["www-authenticate"]
    */
      await authService.actions
        .get(authService.objects.gateCheckApiEndpoint)
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
    it('test gate-check returns 401 when only sending cookie', async () => {
      /**
        * Verify the service gate-check endpoint responds 401 status when only sending correct cookie
        * but no token sent
        Steps:
        - Send get to auth service gate-check-api endpoint when sending correct cookie but no token sent
        Expected Response:
        - Status: 401
        - Text:"Not authenticated"
        - Headers: 'Bearer error="invalid_token" Headers["www-authenticate"]
        */
      await authService.actions
        .get(authService.objects.gateCheckApiEndpoint)
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
    it('test gate-check returns 401 when only sending token', async () => {
      /**
        * Verify the service gate-check endpoint responds 401 status when only sending correct token
        * but no cookie sent
        Steps:
        - Send get to auth service gate-check-api endpoint when sending correct cookie but no token sent
        Expected Response:
        - Status: 401
        - Text:"Not authenticated"
        - Headers: 'Bearer error="invalid_token" in Headers["www-authenticate"]
        */
      await authService.actions
        .get(authService.objects.gateCheckApiEndpoint)
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

    it('test gate-check returns 403 if user is authenticated but not authorized', async () => {
      /**
    * Verify the service gate-check endpoint responds 403 status with sending correct cookie and token but no "X-Original-URI" header specified at all
    Steps:
    - Send get to auth service gate-check endpoint
    Expected Response:
    - Status: 403
    - Text:"Not authorized"
    - Headers: 'Bearer error="insufficient_scope" in Headers["www-authenticate"]
    */
      await authService.actions
        .login({
          username: testLoginData.correctCredential.username,
          password: testLoginData.correctCredential.password
        })
        .then(async (res) => {
          const Cookie = res.headers['set-cookie']
          const token = `Bearer ${res.body.token}`
          await authService.actions
            .get(authService.objects.gateCheckApiEndpoint)
            .set('authorization', token)
            .set('Cookie', Cookie)
            .expect(403)
            .then((res) => {
              expect(res.text).to.eql('Not authorized')
              console.log(res.header)
            })
        })
    })
    it('test all users have access to the gate which has ANY as requires', async () => {
      /**
    * Verify the service gate-check endpoint whoes requires is "ANY" responds 200 status and "Allow" text with all users with setting cookies and users corresponding 'X-Original-URI' and 'X-Original-Method' value
    Steps:
    - Send get to auth service gate-check endpoint whoes requires is "ANY" with cookie, 'X-Original-URI' and 'X-Original-Method' specified
    Expected Response:
    - Status: 200
    - Text:"Allow"
    */
      const anyPrivilegeTable = privilegeCheck.filter((table) =>
        table.requires.flat().includes('ANY')
      )
      for (const userProfile of usersProfile) {
        const URIpath =
          authService.objects.loginServiceURL + anyPrivilegeTable[0].path
        await authService.actions
          .login({
            username: userProfile.username,
            password: userProfile.passwd
          })
          .expect(200)
          .then(async (res) => {
            const Cookie = res.headers['set-cookie']
            const token = `Bearer ${res.body.token}`
            await authService.actions
              .get(authService.objects.gateCheckApiEndpoint)
              .set({ 'X-Original-URI': URIpath, 'X-Original-Method': 'GET' })
              .set('Cookie', Cookie)
              .set('authorization', token)
              .expect(200)
              .then((res) => {
                expect(res.text).to.eql('Allow')
              })
          })
      }
    })
    it('test all users have no access to the gate which has FORBIDDEN as requires', async () => {
      /**
    * Verify the service gate-check endpoint whose requires is 'FORBIDDEN' responds 403 status and "Not authorized" text with all users with setting cookies and users corresponding 'X-Original-URI' and 'X-Original-Method' value
    Steps:
    - Send get to auth service gate-check endpoint whose requires is 'FORBIDDEN' with cookie, 'X-Original-URI' and 'X-Original-Method' specified
    Expected Response:
    - Status: 403
    - Text:"Not authorized"
    - Headers: 'Bearer error="insufficient_scope" in Headers["www-authenticate"]
    */
      const forbiddenPrivilegeTable = privilegeCheck.filter((table) =>
        table.requires.flat().includes('FORBIDDEN')
      )
      for (const userProfile of usersProfile) {
        const URIpath =
          authService.objects.loginServiceURL + forbiddenPrivilegeTable[0].path
        await authService.actions
          .login({
            username: userProfile.username,
            password: userProfile.passwd
          })
          .expect(200)
          .then(async (res) => {
            const Cookie = res.headers['set-cookie']
            const token = `Bearer ${res.body.token}`
            await authService.actions
              .get(authService.objects.gateCheckApiEndpoint)
              .set({ 'X-Original-URI': URIpath, 'X-Original-Method': 'GET' })
              .set('Cookie', Cookie)
              .set('authorization', token)
              .expect(403)
              .then((res) => {
                expect(res.text).to.eql('Not authorized')
                expect(
                  res.headers['www-authenticate']
                    .split(' ')
                    .includes('error="insufficient_scope"')
                ).to.be.true
              })
          })
      }
    })
    it('test all users have access to the gate responds 200 status and Allow', async () => {
      /**
    * Verify the service gate-check endpoint responds 200 status and Allow text with all users who have access to the gate with setting cookies and users corresponding 'X-Original-URI' and 'X-Original-Method' value
    Steps:
    - Send get to auth service gate-check endpoint with cookie, 'X-Original-URI' and 'X-Original-Method' specified
    Expected Response:
    - Status: 200
    - Text:"Allow"
    */
      for (const privilegeTable of privilegeCheck) {
        const usersHavePrivilege = usersProfile.filter((user) => {
          return privilegeTable.rolesHaveAccess.some((role) => {
            return role === user.roles
          })
        })
        for (const user of usersHavePrivilege) {
          const URIpath =
            authService.objects.loginServiceURL + privilegeTable.path
          await authService.actions
            .login({ username: user.username, password: user.passwd })
            .expect(200)
            .then(async (res) => {
              const Cookie = res.headers['set-cookie']
              const token = `Bearer ${res.body.token}`
              await authService.actions
                .get(authService.objects.gateCheckApiEndpoint)
                .set({ 'X-Original-URI': URIpath, 'X-Original-Method': 'GET' })
                .set('Cookie', Cookie)
                .set('authorization', token)
                .expect(200)
                .then((res) => {
                  expect(res.text).to.eql('Allow')
                })
            })
        }
      }
    })
    it('test all users have no access to the gate responds 403 and Not authorized', async () => {
      /**
    * Verify the service gate-check endpoint responds 403 status and Not authorized text with all users who have no access to the gate with setting cookies and users corresponding 'X-Original-URI' and 'X-Original-Method' value
    Steps:
    - Send get to auth service gate-check endpoint with cookie, 'X-Original-URI' and 'X-Original-Method' specified
    Expected Response:
    - Status: 403
    - Text: "Not authorized"
    - Headers: 'Bearer error="insufficient_scope" in Headers["www-authenticate"]
    */
      for (const privilegeTable of privilegeCheck) {
        const usersHavePrivilege = usersProfile.filter((user) => {
          return privilegeTable.rolesHaveAccess.every((role) => {
            return (
              role !== user.roles && privilegeTable.requires.includes(['ANY'])
            )
          })
        })
        for (const user of usersHavePrivilege) {
          const URIpath =
            authService.objects.loginServiceURL + privilegeTable.path
          await authService.actions
            .login({ username: user.username, password: user.passwd })
            .expect(200)
            .then(async (res) => {
              const Cookie = res.headers['set-cookie']
              const token = `Bearer ${res.body.token}`
              await authService.actions
                .get(authService.objects.gateCheckStaticEndpoint)
                .set({ 'X-Original-URI': URIpath, 'X-Original-Method': 'GET' })
                .set('Cookie', Cookie)
                .set('authorization', token)
                .expect(403)
                .then((res) => {
                  expect(res.text).to.eql('Not authorized')
                  expect(
                    res.headers['www-authenticate']
                      .split(' ')
                      .includes('error="insufficient_scope"')
                  ).to.be.true
                })
            })
        }
      }
    })
  })
}
