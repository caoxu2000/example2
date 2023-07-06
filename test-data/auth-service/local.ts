import { userProfile } from '@webServices/auth-service/objects'

export const testLoginData = {
  correctCredential: { username: 'stealth', password: 'stealth' },
  correctUserwrongPass: { username: 'stealth', password: 'wrongpass' },
  userWithoutPass: { username: 'stealth' },
  noUser: { password: 'stealth' },
  wrongTypeUsername: { username: 123, password: 'stealth' },
  wrongTypePassword: { username: 'stealth', password: 2346766 },
  emptyData: {},
  nonExistingUser: { username: 'non-exsiting', password: 'stealth' }
}

export const usersProfile:Array<userProfile> = [
  {
    authtype: 'local',
    username: 'stealth',
    passwd: 'stealth',
    groups: [
      'local_group_surgeon'
    ],
    id: 2000,
    roles: ['Surgeon'],
    privileges: ['viewPHI', 'plan', 'navigate']
  },
  {
    authtype: 'local',
    username: 'stealthadmin',
    passwd: 'stealthadmin',
    groups: [
      'local_group_admin'
    ],
    id: 1000,
    roles: ['Admin'],
    privileges: [
      'changeNetwork',
      'changeCart',
      'auditLogs'
    ]
  },
  {
    authtype: 'local',
    username: 'unprivileged',
    passwd: 'unprivileged',
    groups: [],
    id: 1001,
    privileges: [],
    roles: []
  },
  {
    authtype: 'local',
    username: 'superuser',
    passwd: 'superuser',
    groups: [
      'local_group_surgeon',
      'local_group_admin'
    ],
    id: 2001,
    roles: ['Surgeon', 'Admin'],
    privileges: ['viewPHI', 'plan', 'navigate', 'changeNetwork', 'changeCart', 'auditLogs']
  }
]

export const allPrivileges = ['viewPHI', 'plan', 'navigate', 'changeNetwork', 'changeCart', 'auditLogs']
