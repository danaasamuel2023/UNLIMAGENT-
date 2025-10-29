// Admin authentication middleware
module.exports = async (req, res, next) => {
  try {
    // TODO: Implement admin authorization check
    // This should verify that req.user is an admin
    // Example check: if (!req.user.isAdmin) throw new Error('Unauthorized')
    next();
  } catch (error) {
    res.status(403).json({
      status: 'error',
      message: 'Admin access required'
    });
  }
};

