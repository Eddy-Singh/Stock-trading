import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import ApiError from '../utils/apiError.js'

export class UserService {
	constructor(userRepository) {
		this.userRepository = userRepository
	}

	async createUser({ email, password }) {
		const existingUser = await this.userRepository.findByEmail(email)
		if (existingUser) {
			throw new ApiError(400, 'User already exists')
		}
		const hashedPassword = await bcrypt.hash(password, 10)
		const user = await this.userRepository.create({
			email,
			password: hashedPassword
		})
		const token = jwt.sign(
			{ userId: user._id, isAdmin: user.role === 'admin' },
			process.env.JWT_SECRET,
			{
				expiresIn: '1h'
			}
		)
		return token
	}

	async login({ email, password }) {
		const user = await this.userRepository.findByEmail(email)
		if (!user) {
			throw new ApiError(400, 'User not found')
		}

		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
			throw new ApiError(400, 'Invalid password')
		}
		const token = jwt.sign(
			{ userId: user._id, isAdmin: user.role === 'admin' },
			process.env.JWT_SECRET,
			{
				expiresIn: '1h'
			}
		)
		return token
	}

	async getUserData(userId) {
		const user = await this.userRepository.findById(userId)
		return user
	}
}
