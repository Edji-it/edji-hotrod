module.exports = {
  preset: 'jest-preset-angular',
  roots: ['src'],
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  transform: {
    '\\.(pug)$': '<rootDir>/node_modules/pug-jest',
  },
}
