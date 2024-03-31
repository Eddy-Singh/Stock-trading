module.exports = {
	preset: '@shelf/jest-mongodb',
	testEnvironment: 'node',
	transform: {},
	globalSetup: '<rootDir>/tests/jest.global-setup.js',
	globalTeardown: '<rootDir>/tests/jest.global-teardown.js'
}
