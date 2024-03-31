import jwt from 'jsonwebtoken'

function checkAuth(req, res, next) {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (!token) return res.sendStatus(401)

	jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
		if (err) return res.sendStatus(401)
		req.user = payload
		next()
	})
}

export default checkAuth
