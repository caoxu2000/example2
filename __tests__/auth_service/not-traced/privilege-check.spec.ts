import { expect } from 'chai'
import { authService } from '@root/web-services/auth-service'
import { userProfile } from '@webServices/auth-service/objects'
import {
  usersProfile,
  testLoginData,
  allPrivileges
} from '@testData/auth-service/local'

describe('test privilege-check endpoint', () => {
  let Cookie: string
  let token: string
  let usersHavePrivileges: Array<userProfile>
  let usersHaveNoPrivileges: Array<userProfile>
  beforeAll(async () => {
    usersHavePrivileges = usersProfile.filter(
      (data) => data.privileges.length !== 0
    )
    usersHaveNoPrivileges = usersProfile.filter(
      (data) => data.privileges.length === 0
    )
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
  it('Test privilege-check endpoint returns 401 when user is NOT authenticated', async () => {
    /**
    * Verify the service privilege-check endpoint responds 401 status without setting correct cookie
    Steps:
    - Send post to auth service gate-check endpoint
    Expected Response:
    - Status: 401
    - Body:{ hasPrivilege: 'Not authenticated' }
    */
    await authService.actions
      .post(authService.objects.privilegeCheckEndpoint)
      .expect(401)
      .then((res) => {
        expect(res.body).to.eql({ hasPrivilege: 'Not authenticated' })
      })
  })
  it('Test privilege-check endpoint returns 401 when sending post method with setting cookie but without setting token', async () => {
    /**
    * Verify the service privilege-check endpoint responds 401 status with setting correct cookie but without setting token
    Steps:
    - Send post to auth service gate-check endpoint with setting correct cookie but without setting token
    Expected Response:
    - Status: 401
    - Body:{ hasPrivilege: 'Not authenticated' }
    */
    await authService.actions
      .post(authService.objects.privilegeCheckEndpoint)
      .set('Cookie', Cookie)
      .expect(401)
      .then((res) => {
        expect(res.body).to.eql({ hasPrivilege: 'Not authenticated' })
      })
  })
  it('Test privilege-check endpoint returns 401 when sending post method with setting token but without setting cookie', async () => {
    /**
    * Verify the service privilege-check endpoint responds 401 status with setting token but without setting cookie
    Steps:
    - Send post to auth service gate-check endpoint with setting token but without setting cookie
    Expected Response:
    - Status: 401
    - Body:{ hasPrivilege: 'Not authenticated' }
    */
    await authService.actions
      .post(authService.objects.privilegeCheckEndpoint)
      .set('authorization', token)
      .expect(401)
      .then((res) => {
        expect(res.body).to.eql({ hasPrivilege: 'Not authenticated' })
      })
  })
  it('Test privilege-check endpoint returns 400 when user is authenticated but no privilege specified', async () => {
    /**
    * Verify the service privilege-check endpoint responds 401 when user is authenticated but no privilege specified
    Steps:
    - Send post to auth service gate-check endpoint
    Expected Response:
    - Status: 400
    - Body:{ hasPrivilege: 'No privilege specified' }
    */
    await authService.actions
      .post(authService.objects.privilegeCheckEndpoint)
      .set('Cookie', Cookie)
      .set('authorization', token)
      .expect(400)
      .then((res) => {
        expect(res.body).to.eql({ hasPrivilege: 'No privilege specified' })
      })
  })
  it('Test privilege-check endpoint returns 200 and hasPrivilege true when user who has specified privileges is authenticated and privilege specified', async () => {
    /**
    * Verify the service privilege-check endpoint responds 200 and hasPrivilege true when user who has specified privileges is authenticated and privilege specified
    Steps:
    - Send post to auth service privilege-check endpoint
    Expected Response:
    - Status: 200
    - Body:{ hasPrivilege: true }
    */
    for (const userProfile of usersHavePrivileges) {
      await authService.actions
        .login({ username: userProfile.username, password: userProfile.passwd })
        .then(async (res) => {
          const Cookie = res.headers['set-cookie']
          const token = `Bearer ${res.body.token}`
          for (const privilege of userProfile.privileges) {
            await authService.actions
              .post(authService.objects.privilegeCheckEndpoint)
              .send({ privilege: privilege })
              .set('Cookie', Cookie)
              .set('authorization', token)
              .expect(200)
              .then((res) => {
                expect(res.body).to.eql({ hasPrivilege: true })
              })
          }
        })
    }
  })
  it("Test privilege-check endpoint returns 401 and 'Not authenticated' when user who has specified privileges is authenticated and privilege specified with setting cookie but without setting token", async () => {
    /**
    * Verify the service privilege-check endpoint returns 401 and 'Not authenticated' when user who has specified privileges is authenticated and privilege specified with setting cookie but without setting token
    Steps:
    - Send post to auth service privilege-check endpoint with setting cookie but without setting token
    Expected Response:
    - Status: 401
    - Body:{"hasPrivilege": "Not authenticated"}
    */
    for (const userProfile of usersHavePrivileges) {
      await authService.actions
        .login({ username: userProfile.username, password: userProfile.passwd })
        .then(async (res) => {
          const Cookie = res.headers['set-cookie']
          for (const privilege of userProfile.privileges) {
            await authService.actions
              .post(authService.objects.privilegeCheckEndpoint)
              .send({ privilege: privilege })
              .set('Cookie', Cookie)
              .expect(401)
              .then((res) => {
                expect(res.body).to.eql({ hasPrivilege: 'Not authenticated' })
              })
          }
        })
    }
  })
  it('Test privilege-check endpoint returns 401 when user who has specified privileges is authenticated and privilege specified with setting token but without setting cookie', async () => {
    /**
    * Verify the service privilege-check endpoint returns 401 and 'Not authenticated' when user who has specified privileges is authenticated and privilege specified with setting cookie but without setting token
    Steps:
    - Send post to auth service privilege-check endpoint with setting cookie but without setting token
    Expected Response:
    - Status: 401
    - Body:{"hasPrivilege": "Not authenticated"}
    */
    for (const userProfile of usersHavePrivileges) {
      await authService.actions
        .login({ username: userProfile.username, password: userProfile.passwd })
        .then(async (res) => {
          const token = `Bearer ${res.body.token}`
          for (const privilege of userProfile.privileges) {
            await authService.actions
              .post(authService.objects.privilegeCheckEndpoint)
              .send({ privilege: privilege })
              .set('authorization', token)
              .expect(401)
              .then((res) => {
                expect(res.body).to.eql({ hasPrivilege: 'Not authenticated' })
              })
          }
        })
    }
  })
  it('Test privilege-check endpoint returns 200 and hasPrivilege false when user who has no specified privilege is authenticated and privilege specified', async () => {
    /**
    * Verify the service privilege-check endpoint responds 200 and hasPrivilege false when user who has no specified privileges is authenticated and privilege specified
    Steps:
    - Send post to auth service gate-check endpoint
    Expected Response:
    - Status: 200
    - Body:{ hasPrivilege: false }
    */
    for (const userProfile of usersHaveNoPrivileges) {
      await authService.actions
        .login({ username: userProfile.username, password: userProfile.passwd })
        .then(async (res) => {
          const Cookie = res.headers['set-cookie']
          const token = `Bearer ${res.body.token}`
          for (const privilege of allPrivileges) {
            await authService.actions
              .post(authService.objects.privilegeCheckEndpoint)
              .send({ privilege: privilege })
              .set('Cookie', Cookie)
              .set('authorization', token)
              .expect(200)
              .then((res) => {
                expect(res.body).to.eql({ hasPrivilege: false })
              })
          }
        })
    }
  })
})
