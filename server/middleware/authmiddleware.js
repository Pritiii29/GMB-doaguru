const jwt = require("jsonwebtoken");

const authMiddleware = (roles = []) => {
    return (req, res, next) => {
        try {
            const token = req.cookies.token;

            if (!token) {
                return res.status(401).json({ message: "No token, access denied" });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ message: "Access denied" });
            }

            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: "Invalid token" });
        }
    };
};

module.exports = authMiddleware;