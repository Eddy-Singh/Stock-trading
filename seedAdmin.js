import bcrypt from 'bcryptjs'
import User from './src/models/user.model'

async function seedAdminUser() {
	const adminData = {
		email: 'adminUser@email.com',
		password: bcrypt.hashSync('adminPassword', 10),
		role: 'admin'
	}

	// Check if the admin already exists to avoid duplicates
	const existingAdmin = await User.findOne({ username: adminData.username })
	if (!existingAdmin) {
		await User.create(adminData)
	}
}

export default seedAdminUser
