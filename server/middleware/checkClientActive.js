module.exports = (req, res, next) => {
    if (!req.user.isActive) {
        return res.status(403).json({
            message: "Account deactivated. Contact admin."
        });
    }
    next();
};