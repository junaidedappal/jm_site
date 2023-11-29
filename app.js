const express = require('express');
const expressHandlebars = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const { authenticate } = require('./middleware/authMiddleware');
const { uploadMiddleware } = require('./middleware/fileUploadMiddleware');
const adminController = require('./controllers/adminController');
const arabController = require('./controllers/arabController');
// const engController = require('./controllers/engController');
const db = require('./db');
const crypto = require('crypto');
const app = express();
const port = process.env.PORT || 3000;
//date formatter
const moment = require('moment');
// Define the base URL
const baseUrl = 'https://localhost:3000';
// Make baseUrl available globally to all routes
app.locals.baseUrl = baseUrl;

// Serve static files
app.use(express.static('public'));
app.use(express.static('uploads'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Enable file uploads
app.use(uploadMiddleware);
// Set up session middleware
app.use(session({
  secret: 'jamia',
  resave: false,
  saveUninitialized: false,
}));

// Middleware for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Set up Handlebars as the view engine
app.engine('hbs', expressHandlebars.engine({ extname: 'hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

//date formatter
app.engine('hbs', expressHandlebars.engine({
  extname: 'hbs',
  helpers: {
    formatDate: function (date) {
      return moment(date).format('YYYY-MM-DD');
    }
  }
}));


app.use('/admin', authenticate, adminController);
app.use('/', arabController);
// app.use('/en', engController);

// Login route
app.get('/login', (req, res) => {
  res.render('admin/login', { title: 'Login here' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Hash the entered password using MD5
  const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
  // Check credentials in the database
  const query = 'SELECT * FROM admins WHERE username = ? AND password_hash = ?';
  db.query(query, [username, hashedPassword], (err, result) => {
    if (err) {
      console.error('Error querying the database:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    if (result.length > 0) {
      // Successful login
      req.session.user = { username }; // Store user information in the session
      res.redirect('/admin');
    } else {
      // Invalid credentials
      res.send('Invalid username or password');
    }
  });
});


// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.redirect('/login');
  });
});
// Catch-all route for handling undefined routes
app.use((req, res) => {
  res.status(404).render('not-found', { title: 'Not Found' });
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
