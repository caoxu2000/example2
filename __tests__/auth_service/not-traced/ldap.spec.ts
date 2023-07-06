import {
  localAndLdapTests,
  localAndLdapCookiesTest
} from './share-tests/local-ldap-common'
import { gateCheck } from './share-tests/gate-check-common'
import { testLoginData, usersProfile } from '@testData/auth-service/ldap'
import { privilegeCheck } from '@testData/auth-service/common'

describe('test local strategy', () => {
  localAndLdapTests(testLoginData, usersProfile, 'ldap')
  if (process.env.url === 'http://127.0.0.1') {
    localAndLdapCookiesTest(testLoginData, 'local')
  }
})
describe('test gate check for local strategy', () => {
  gateCheck(testLoginData, usersProfile, privilegeCheck, 'ldap')
})
