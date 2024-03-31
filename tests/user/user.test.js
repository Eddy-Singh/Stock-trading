import request from 'supertest'
import app from '../../src/app.js'
import mongoose from 'mongoose'

describe('User API endpoints', () => {
	beforeAll(async () => {
		await mongoose.connect(process.env.MONGO_URI)
	}, 10000)

	afterAll(async () => {
		await mongoose.disconnect()
	})

	describe('POST /api/users/register', () => {
		it('should validate user input and return 400 for invalid data', async () => {
			const response = await request(app).post('/api/users/register').send({
				email: 'invalid-email',
				password: '123'
			})

			expect(response.statusCode).toBe(400)
			expect(response.body).toHaveProperty('error')
		})

		it('should register a new user', async () => {
			const newUser = {
				email: 'test@example.com',
				password: 'password123'
			}

			const response = await request(app)
				.post('/api/users/register')
				.send(newUser)
			expect(response.statusCode).toBe(201)
			expect(response.body).toHaveProperty('token')
			expect(response.body).toHaveProperty(
				'message',
				'User signed up successfully'
			)
		})

		it('should prevent duplicate user registration', async () => {
			const userData = {
				email: 'test2@example.com',
				password: 'Password123!'
			}

			// First registration attempt
			const response1 = await request(app)
				.post('/api/users/register')
				.send(userData)

			expect(response1.statusCode).toBe(201)
			expect(response1.body).toHaveProperty('token')
			expect(response1.body).toHaveProperty(
				'message',
				'User signed up successfully'
			)

			// Attempt to register again with the same email and password
			const response2 = await request(app)
				.post('/api/users/register')
				.send(userData)

			expect(response2.statusCode).toBe(400)
			expect(response2.body).toHaveProperty('error')
			expect(response2.body.error).toEqual('User already exists')
		})
	})

	describe('POST /api/users/login', () => {
		const userData = {
			email: 'login-test@example.com',
			password: 'Password123!'
		}

		beforeAll(async () => {
			await request(app).post('/api/users/register').send(userData)
		})

		it('should validate user input and return 400 for invalid data', async () => {
			const response = await request(app).post('/api/users/login').send({
				email: 'invalid-email',
				password: '123'
			})

			expect(response.statusCode).toBe(400)
			expect(response.body).toHaveProperty('error')
		})

		it('should allow a user to log in with correct credentials', async () => {
			const response = await request(app).post('/api/users/login').send({
				email: userData.email,
				password: userData.password
			})

			expect(response.statusCode).toBe(200)
			expect(response.body).toHaveProperty('token')
			expect(response.body).toHaveProperty(
				'message',
				'User logged in successfully'
			)
		})
		it('should reject login with unregistered email', async () => {
			const response = await request(app).post('/api/users/login').send({
				email: 'not-exist@example.com',
				password: 'Password123!'
			})

			expect(response.statusCode).toBe(400) // Assuming 400 for user not found
			expect(response.body).toHaveProperty('error')
			expect(response.body.error).toEqual('User not found') // Adjust based on your actual error message
		})
		it('should reject login with incorrect password', async () => {
			const response = await request(app).post('/api/users/login').send({
				email: userData.email,
				password: 'WrongPassword123!'
			})

			expect(response.statusCode).toBe(400) // Assuming 400 for incorrect credentials
			expect(response.body).toHaveProperty('error')
			expect(response.body.error).toEqual('Invalid password') // Adjust based on your actual error message
		})
	})

	describe('Profile Endpoint', () => {
		let authToken

		beforeAll(async () => {
			// Create a user
			const registerResponse = await request(app)
				.post('/api/users/register')
				.send({ email: 'user@example.com', password: 'testpassword' })
			authToken = registerResponse.body.token
		})

		it('should return the user profile for authenticated user', async () => {
			const response = await request(app)
				.get('/api/users/profile')
				.set('Authorization', `Bearer ${authToken}`) // Setting the authorization header

			expect(response.statusCode).toBe(200)
			expect(response.body).toHaveProperty('user')
			// Add more specific checks as necessary, e.g., checking that the returned user has the correct email
			expect(response.body.user).toHaveProperty('email', 'user@example.com')
		})

		it('should deny access without a valid token', async () => {
			const response = await request(app)
				.get('/api/users/profile')
				.set('Authorization', 'Bearer invalidtoken123') // Setting an invalid token

			expect(response.statusCode).toBe(401) // Assuming 401 Unauthorized for invalid tokens
			// You might want to check for a specific error message as well, depending on how your app handles these cases
		})
	})
})
