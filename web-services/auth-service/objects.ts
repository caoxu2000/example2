import config from '@root/jest.config'

/*
* All the enpoints information is listed below
*/

export const loginServiceURL = config.testURL
export const authEndPoint = '/auth/'
export const authLoginEndPoint = '/auth/login'
export const loginFailedEndPoint = '/auth/login/fail'
export const loginCallBackEndPoint = '/auth/login/callback'
export const logoutEndPoint = '/auth/logout'
export const requireCredentialEndPoint = '/auth/requires-credentials'
export const loginStrategyEndPoint = '/auth/login-strategy'
export const isAuthenticatedEndPoint = '/auth/is-authenticated'
export const usernameEndpoint = '/auth/username'
export const userProfileEndpoint = '/auth/user-profile'
export const gateCheckStaticEndpoint = '/auth/gate-check-static'
export const gateCheckApiEndpoint = '/auth/gate-check-api'
export const privilegeCheckEndpoint = '/auth/privilege-check'
export const keepAliveEndPoint = '/auth/keep-alive'
export const loginURL = loginServiceURL + authLoginEndPoint
export const redirectCallbackURL = loginServiceURL + loginCallBackEndPoint
export const isAuthenticatedURL = loginServiceURL + isAuthenticatedEndPoint
export const userNameURL = loginServiceURL + usernameEndpoint
export const ssoIdp = 'https://login.microsoftonline.com/0a29d274-1367-4a8f-99c5-90c3dc7d4043/saml2'

export interface ldapUserProfile{
  authtype:string,
  username: string,
  passwd: string,
  roles: Array<string>,
  privileges: Array<string>,
  token?: string
}

export interface userProfile extends ldapUserProfile{
  groups: Array<string>
  id: number
}

export interface privilegeCheck {
    path: string,
    methods?: Array<string>,
    requires: Array<Array<string>>,
    rolesHaveAccess:Array<Array<string>>
  }

export interface testLoginDataType {
  'correctCredential':{username: string, password: string},
  'correctUserwrongPass': {username: string, password: string},
  'userWithoutPass': {username: string},
  'noUser': {password: string},
  'wrongTypeUsername': {username: number, password: string},
  'wrongTypePassword':{username: string, password: number},
  'emptyData' : {},
  'nonExistingUser': {username: string, password: string}
}
