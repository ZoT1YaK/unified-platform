// Controller function for the dashboard
exports.getDashboard = (req, res) => {
    res.status(200).json({
        message: "Welcome to your dashboard!",
        user: req.user,
    });
};  