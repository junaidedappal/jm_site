// Authentication middleware
const authenticate = (req, res, next) => {
    if (req.session.user) {
      console.log('authentication success');
      // User is authenticated, proceed to the next middleware or route
      next();
    } else {
      // User is not authenticated, redirect to login page
      console.log('authentication failed');
      res.redirect('/');
    }
  };
  
  module.exports = { authenticate };
  