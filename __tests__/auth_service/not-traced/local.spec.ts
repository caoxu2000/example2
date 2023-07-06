import {
  localAndLdapTests,
  localAndLdapCookiesTest
} from './share-tests/local-ldap-common'
import { gateCheck } from './share-tests/gate-check-common'
import { testLoginData, usersProfile } from '@testData/auth-service/local'
import { privilegeCheck } from '@testData/auth-service/common'
import config from '@root/jest.config'

describe('test local strategy', () => {
  localAndLdapTests(testLoginData, usersProfile, 'local')
  if (config.testURL === 'http:127.0.0.1') {
    localAndLdapCookiesTest(testLoginData, 'local')
  }
})
describe('test gate check for local strategy', () => {
  gateCheck(testLoginData, usersProfile, privilegeCheck, 'local')
})
