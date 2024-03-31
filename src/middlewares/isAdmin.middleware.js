const isAdmin = (req, res, next) => {
	if (!req.user || !req.user.isAdmin) {
		return res.status(403).json({ message: 'Unauthorized' })
	}
	next()
}

export default isAdmin
