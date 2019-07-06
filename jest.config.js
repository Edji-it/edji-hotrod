module.exports = {
  preset: 'jest-preset-angular',
  roots: ['src'],
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  transform: {
    '\\.(pug)$': '<rootDir>/node_modules/pug-jest',
  },
  reporters: [
    'default',
    'jest-junit',
    // [
    //   'jest-junit',
    //   {
    //     outputName: './test.xml',
    //     outputDirectory: './output',
    //   },
    // ],
  ],
}
