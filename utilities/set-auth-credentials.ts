import { authService } from '@webServices/auth-service'

export type Credentials = {
    authCookie: string,
    authToken: string
}

/**
 * Login using REST API endpoint to return the response from logging in
 * @param {string} username 
 * @param {string} password 
 * @returns authCredentials object containing authCookie and authToken
 */
export async function authCredentials( username:string,password:string ) {
    
    let loginRes = await authService.actions.login(username, password)
    
    let authCredentials:Credentials = {
        authCookie: loginRes.header['set-cookie'],
        authToken: `Bearer ${loginRes.body.token}`
    }

    return authCredentials
}