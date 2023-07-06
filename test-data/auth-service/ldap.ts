import { testLoginDataType, ldapUserProfile } from '@root/web-services/auth-service/objects'

export const testLoginData: testLoginDataType = {
  correctCredential: { username: 'taylol21', password: 'idmpassword' },
  correctUserwrongPass: { username: 'stealth', password: 'wrongpass' },
  userWithoutPass: { username: 'stealth' },
  noUser: { password: 'stealth' },
  wrongTypeUsername: { username: 123, password: 'stealth' },
  wrongTypePassword: { username: 'stealth', password: 2346766 },
  emptyData: {},
  nonExistingUser: { username: 'non-exsiting', password: 'stealth' }
}
export const usersProfile:Array<ldapUserProfile> = [
  {
    authtype: 'ldap',
    username: 'taylol21',
    passwd: 'idmpassword',
    roles: ['Admin'],
    privileges: ['changeNetwork', 'changeCart', 'auditLogs']
  }
]

export const privilegeCheck = [
  {
    path: '/test-gate-check/stealthGetOrPost',
    methods: ['GET', 'POST'],
    requires: [
      ['viewPHI',
        'plan',
        'navigate']
    ],
    rolesHaveAccess: [['Surgeon'], ['Admin', 'Surgeon']]
  },
  {
    path: '/test-gate-check/object/9f/class',
    requires: [
      ['objectManagement']
    ],
    rolesHaveAccess: []
  },
  {
    path: '/test-gate-check/disjunctionTest',
    requires: [
      [
        'viewPHI'
      ],
      [
        'auditLogs',
        'changeNetwork'
      ]
    ],
    rolesHaveAccess: [['Surgeon'], ['Admin', 'Surgeon']]
  },
  {
    path: '/test-gate-check/canFooBar/5a/objectOp',
    requires: [['canFooBar']],
    rolesHaveAccess: []
  },
  {
    path: '/test-gate-check/ANY',
    requires: [['ANY']],
    rolesHaveAccess: [['Surgeon'], ['Admin', 'Surgeon'], ['Admin'], []]
  },
  {
    path: '/test-gate-check/viewPHI',
    requires: [['viewPHI']],
    rolesHaveAccess: [['Surgeon'], ['Admin', 'Surgeon']]
  },
  {
    path: '/test-gate-check/plan/',
    requires: [['plan']],
    rolesHaveAccess: [['Surgeon'], ['Admin', 'Surgeon']]
  },
  {
    path: '/test-gate-check/navigate',
    requires: [['navigate']],
    rolesHaveAccess: [['Surgeon'], ['Admin', 'Surgeon']]
  },
  {
    path: '/test-gate-check/changeNetwork',
    requires: [['changeNetwork']],
    rolesHaveAccess: [['Surgeon'], ['Admin']]
  },
  {
    path: '/test-gate-check/changeCart/',
    requires: [['changeCart']],
    rolesHaveAccess: [['Admin', 'Surgeon'], ['Admin']]
  },
  {
    path: '/test-gate-check/auditLogs',
    requires: [['auditLogs']],
    rolesHaveAccess: [['Admin', 'Surgeon'], ['Admin']]
  },
  {
    path: '/test-gate-check/forbiddenOnly',
    requires: [['FORBIDDEN']],
    rolesHaveAccess: []
  },
  {
    path: '/test-gate-check/allStealth',
    requires: [
      ['viewPHI',
        'plan',
        'navigate']
    ],
    rolesHaveAccess: [['Surgeon'], ['Admin', 'Surgeon']]
  },
  {
    path: '/test-gate-check/allAdmin',
    requires: [
      ['changeNetwork',
        'changeCart',
        'auditLogs']
    ],
    rolesHaveAccess: [['Admin', 'Surgeon'], ['Admin']]
  },
  {
    path: '/test-gate-check/allSuper',
    requires: [
      ['viewPHI',
        'plan',
        'navigate',
        'changeNetwork',
        'changeCart',
        'auditLogs']
    ],
    rolesHaveAccess: [['Admin', 'Surgeon']]
  }
]
