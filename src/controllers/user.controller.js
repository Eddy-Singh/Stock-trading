import { validationResult } from 'express-validator'
import ApiError from '../utils/apiError.js'

export class UserController {
	constructor(userService) {
		this.userService = userService
	}

	async register(req, res) {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			throw new ApiError(400, 'Invalid email or password')
		}
		const { email, password } = req.body
		const token = await this.userService.createUser({ email, password })
		res.status(201).json({ token, message: 'User signed up successfully' })
	}

	async login(req, res) {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			throw new ApiError(400, 'Invalid email or password')
		}
		const { email, password } = req.body
		const token = await this.userService.login({ email, password })
		res.status(200).json({ token, message: 'User logged in successfully' })
	}

	async getProfile(req, res) {
		const user = await this.userService.getUserData(req.user.userId)
		res.json({ user })
	}
}
