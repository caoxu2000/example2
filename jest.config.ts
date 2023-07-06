import { pathsToModuleNameMapper } from 'ts-jest/utils'
import { compilerOptions } from './tsconfig.json'
import type { InitialOptionsTsJest } from 'ts-jest/dist/types'

const config: InitialOptionsTsJest = {
  globals: {
    'ts-jest': {
    }
  },
  preset: 'ts-jest',
  verbose: true,
  testURL: process.env.url || 'https://127.0.0.1',
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  testMatch: [
    '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  testPathIgnorePatterns: [
    './__tests__/auth_service/ldap',
    './__tests__/auth_service/null',
    './__tests__/auth_service/privilege-check',
    './__tests__/auth_service/sso'
  ],
  moduleFileExtensions: ['js', 'ts', 'yaml'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  reporters: ["default", "jest-junit"],
  testTimeout: 180000,
  testResultsProcessor: 'jest-teamcity-reporter'
}

export default config
