import request from 'supertest'
import app from '../../src/app.js'
import mongoose from 'mongoose'
import seedAdminUser from '../../seedAdmin.js'

describe('User API endpoints', () => {
	let adminToken, userToken

	beforeAll(async () => {
		await mongoose.connect(process.env.MONGO_URI)

		await seedAdminUser()
		const response = await request(app).post('/api/users/login').send({
			email: 'adminUser@email.com',
			password: 'adminPassword'
		})

		adminToken = response.body.token

		const registerResponse = await request(app)
			.post('/api/users/register')
			.send({ email: 'testuser@example.com', password: 'testpassword' })
		userToken = registerResponse.body.token
	}, 10000)

	afterAll(async () => {
		await mongoose.disconnect()
	})

	describe('POST /games/create', () => {
		it('should validate input and create a new game', async () => {
			const response = await request(app)
				.post('/api/games/create')
				.send({
					name: 'New Game',
					startTime: '2023-01-01T00:00:00Z',
					endTime: '2023-12-31T00:00:00Z',
					initialAmount: 1000
				})
				.set('Authorization', `Bearer ${adminToken}`)

			expect(response.statusCode).toEqual(201)
			expect(response.body).toHaveProperty('name', 'New Game')
		})
	})

	describe('GET /games', () => {
		it('should return paginated list of games', async () => {
			const response = await request(app)
				.get('/api/games')
				.query({ page: 1, limit: 10 })
				.set('Authorization', `Bearer ${adminToken}`)
			expect(response.statusCode).toEqual(200)
			expect(Array.isArray(response.body.games)).toBeTruthy()
		})
	})

	describe('GET /games/:id', () => {
		it('should get a single game by id', async () => {
			const response1 = await request(app)
				.post('/api/games/create')
				.send({
					name: 'Test Game',
					startTime: '2023-01-01T00:00:00Z',
					endTime: '2023-12-31T00:00:00Z',
					initialAmount: 1000
				})
				.set('Authorization', `Bearer ${adminToken}`)
			const response2 = await request(app)
				.get(`/api/games/${response1.body._id}`)
				.set('Authorization', `Bearer ${adminToken}`) // Ensure you have a mechanism to get a userToken
			expect(response2.status).toBe(200)
			expect(response2.body).toHaveProperty('name', 'Test Game')
			// Add more assertions as necessary
		})

		it('should return 404 if game not found', async () => {
			const response = await request(app)
				.get('/api/games/41224d776a326fb40f000001')
				.set('Authorization', `Bearer ${adminToken}`) // Use a valid user token

			expect(response.status).toBe(404)
		})
	})
	describe('POST /games/:id/register', () => {
		let game
		beforeAll(async () => {
			const response = await request(app)
				.post('/api/games/create')
				.send({
					name: 'Dummy Game',
					startTime: '2023-01-01T00:00:00Z',
					endTime: '2023-12-31T00:00:00Z',
					initialAmount: 1000
				})
				.set('Authorization', `Bearer ${adminToken}`)
			game = response.body
		})
		it('should register a user for a game', async () => {
			const response = await request(app)
				.post(`/api/games/${game._id}/register`)
				.set('Authorization', `Bearer ${userToken}`)

			expect(response.status).toBe(200)
			expect(response.body).toHaveProperty('cash', 1000)
		})

		it('should return 400 if user already registered', async () => {
			await request(app)
				.post(`/api/games/${game._id}/register`)
				.set('Authorization', `Bearer ${adminToken}`)

			// Attempt to register again
			const response = await request(app)
				.post(`/api/games/${game._id}/register`)
				.set('Authorization', `Bearer ${adminToken}`)

			expect(response.status).toBe(400)
			expect(response.body.error).toBeDefined()
		})

		it('should return 404 if game not found', async () => {
			const response = await request(app)
				.post('/api/games/41224d776a326fb40f000001/register')
				.set('Authorization', `Bearer ${adminToken}`)

			expect(response.status).toBe(404)
		})
	})

	describe('POST /games/:id/buy', () => {
		let gameId

		beforeAll(async () => {
			const response = await request(app)
				.post('/api/games/create')
				.send({
					name: 'Some Game',
					startTime: '2024-01-01T00:00:00Z',
					endTime: '2024-12-31T00:00:00Z',
					initialAmount: 1000
				})
				.set('Authorization', `Bearer ${adminToken}`)
			gameId = response.body._id
			await request(app)
				.post(`/api/games/${gameId}/register`)
				.set('Authorization', `Bearer ${userToken}`)
		})

		it('should allow a user to buy stocks within a game', async () => {
			const stockToBuy = {
				stockSymbol: 'AAPL',
				quantity: 1
			}

			const response = await request(app)
				.post(`/api/games/${gameId}/buy`)
				.send(stockToBuy)
				.set('Authorization', `Bearer ${userToken}`)

			expect(response.status).toBe(200)
			expect(response.body).toHaveProperty(
				'message',
				'Stocks purchased successfully'
			)
		})

		it('should return 400 if insufficient funds', async () => {
			const stockToBuy = {
				stockSymbol: 'AAPL',
				quantity: 1000 // Assuming this quantity is not affordable
			}

			const response = await request(app)
				.post(`/api/games/${gameId}/buy`)
				.send(stockToBuy)
				.set('Authorization', `Bearer ${userToken}`)
			console.log(response)
			expect(response.status).toBe(400)
			expect(response.body.error).toBeDefined()
		})
	})

	describe('POST /games/:id/sell', () => {
		let gameId

		beforeAll(async () => {
			const response = await request(app)
				.post('/api/games/create')
				.send({
					name: 'Some Dummy Game',
					startTime: '2024-01-01T00:00:00Z',
					endTime: '2024-12-31T00:00:00Z',
					initialAmount: 1000
				})
				.set('Authorization', `Bearer ${adminToken}`)
			gameId = response.body._id
			await request(app)
				.post(`/api/games/${gameId}/register`)
				.set('Authorization', `Bearer ${userToken}`)

			const stockToBuy = {
				stockSymbol: 'AAPL',
				quantity: 1
			}

			await request(app)
				.post(`/api/games/${gameId}/buy`)
				.send(stockToBuy)
				.set('Authorization', `Bearer ${userToken}`)
		})

		it('should allow a user to sell stocks within a game', async () => {
			const stockToSell = {
				stockSymbol: 'AAPL',
				quantity: 1
			}

			const response = await request(app)
				.post(`/api/games/${gameId}/sell`)
				.send(stockToSell)
				.set('Authorization', `Bearer ${userToken}`)

			expect(response.body).toHaveProperty(
				'message',
				'Stocks sold successfully'
			)
		})

		it('should return 400 if trying to sell more stocks than owned', async () => {
			const stockToSell = {
				symbol: 'AAPL',
				quantity: 500
			}

			const response = await request(app)
				.post(`/api/games/${gameId}/sell`)
				.send(stockToSell)
				.set('Authorization', `Bearer ${userToken}`)

			expect(response.status).toBe(400)
			expect(response.body.error).toBeDefined()
		})
	})
})
