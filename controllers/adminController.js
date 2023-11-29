// Import necessary modules
const express = require('express');
const PostModel = require('../models/postModel'); 
const { body, validationResult } = require('express-validator');
const path = require('path');
const router = express.Router();
const db = require('../db'); 
const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const fs = require('fs').promises; // Import the fs module


// Update this middleware to set the layout to 'admin' for all routes in this controller
router.use((req, res, next) => {
  res.locals.layout = 'admin'; // Setting the layout to 'admin.hbs'
  next();
});


router.get('/', (req, res) => {
  // Check if the user is authenticated

  if (req.session.user) {
    // Fetch all posts from the database (replace with your actual query)
    const query = 'SELECT * FROM posts';
    db.query(query, (err, posts) => {
      if (err) {
        console.error('Error querying posts:', err);
        res.status(500).send('Internal Server ');
        return;
      }
      // Render the admin page with the retrieved posts
      res.render('admin/dashboard', { username: req.session.user.username, posts });
    });
  } else {
    // Redirect to the login page if not authenticated
    res.redirect('/login');
  }
});
router.get('/view-post/:id', (req, res) => {
    // Fetch and render the details of a specific post (replace with your actual query)
    const postId = req.params.id;
    const query = 'SELECT * FROM posts WHERE id = ?';
    db.query(query, [postId], (err, post) => {
      if (err) {
        console.error('Error querying post details:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      // Render the view page with the retrieved post details
      res.render('admin/view-post', { post: post[0] });
    });
  });
  
  router.get('/edit-post/:id', (req, res) => {
    const postId = req.params.id;
    const query = 'SELECT * FROM posts WHERE id = ?';
    db.query(query, [postId], (err, post) => {
      if (err) {
        console.error('Error querying post details:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      res.render('admin/edit-post', { post: post[0] });
    });
  });
  
  
  // Edit data route with simple image upload using fs
  router.post('/edit-post/:id', (req, res) => {
    const postId = req.params.id;
    const { title, category,date, tags, content } = req.body;
    const newData = req.body.newData;
    const new_image = req.files ? req.files.image : null;
    // If there's an uploaded image
    if (new_image) {
  
      const query = 'SELECT image FROM posts WHERE id = ?';
      db.query(query, [postId], (err, results) => {
        if (err) {
          console.error('Error fetching image path: ' + err.stack);
          res.status(500).send('Error fetching image path');
          return;
        }
          
          const imageFilename = results[0].image;
          const imagePath = path.join(__dirname, '..', imageFilename);
      // Delete the image file
      fs.unlink(imagePath, err => {
        if (err) {
          console.error('Error deleting image file: ' + err.stack);
          res.status(500).send('Error deleting image file');
          return;
        }});
      });
  
      // Set the file path
      const imageUrl = `uploads/posts/${Date.now()}_${new_image.name}`;
       
      // Move the file to the specified directory
      new_image.mv(imageUrl, (err) => {
        if (err) {
          console.error('Error saving image:', err);
          return res.status(500).send('Internal Server Error');
        }
        //update to database
        const query = 'UPDATE posts SET title = ?,image= ?,date=?, category = ?, tags = ?, content = ? WHERE id = ?';
        db.query(query, [title, imageUrl,date, category, tags, content, postId], (err) => {
          if (err) {
            console.error('Error updating post:', err);
            res.status(500).send('Internal Server Error');
            return;
          }
          res.redirect('/admin');
        });
      });
    } else {
      // Update the data in the database without an image
      const query = 'UPDATE posts SET title = ?,date=?, category = ?, tags = ?, content = ? WHERE id = ?';
      db.query(query, [title,date, category, tags, content, postId], (err) => {
        if (err) {
          console.error('Error updating post:', err);
          res.status(500).send('Internal Server Error');
          return;
        }
        res.redirect('/admin');
      });
    }
  });
  
  
  // Delete post route
  router.post('/delete-post/:id', async (req, res) => {
    const postId = req.params.id;
  
    // Retrieve the image filename associated with the post from the database
    const query = 'SELECT image FROM posts WHERE id = ?';
    db.query(query, [postId], async (err, result) => {
      if (err) {
        console.error('Error retrieving image filename:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      // Check if the result contains the image filename
      if (result.length > 0 && result[0].image) {
        const imageFilename = result[0].image;
  
        // Delete the post from the database
        const deleteQuery = 'DELETE FROM posts WHERE id = ?';
        db.query(deleteQuery, [postId], async (err) => {
          if (err) {
            console.error('Error deleting post:', err);
            res.status(500).send('Internal Server Error');
            return;
          }
  
          // Delete the associated image file
          const imagePath = path.join(__dirname, '..', imageFilename);
         
          try {
            await fs.unlink(imagePath);
            console.log(`Image ${imagePath} deleted successfully.`);
          } catch (error) {
            console.error(`Error deleting image ${imagePath}: ${error.message}`);
          }
  
          res.redirect('/admin');
        });
      } else {
        res.status(404).send('Post not found');
      }
    });
  });
  
  // Route to render the create post form
  router.get('/create-post', (req, res) => {
    res.render('admin/create-post', { formData: {} });
  });
  
  // Route to handle the creation of a new post
  router.post('/create-post', [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
    body('tags').trim().isLength({ min: 1 }).withMessage('Tags are required'),
    body('date').trim().isLength({ min: 1 }).withMessage('date  required'),
    body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  ], (req, res) => {
    const { title,date, category, tags, content } = req.body;
  
    // Check if a file is included in the request
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('Image is required');
    }
    const image = req.files.image;
    const imageUrl = `uploads/posts/${Date.now()}_${image.name}`;
    // Move the file to the specified directory
    image.mv(imageUrl, (err) => {
      if (err) {
        console.error('Error saving image:', err);
        return res.status(500).send('Internal Server Error');
      }
  
      // Insert the new post into the database
      const query = 'INSERT INTO posts (title, category,date, tags, content, image) VALUES (?, ?, ?, ?, ?,?)';
      db.query(query, [title, category,date, tags, content, imageUrl], (dbErr) => {
        if (dbErr) {
          console.error('Error creating post:', dbErr);
          return res.status(500).send('Internal Server Error');
        }
  
        res.redirect('/admin');
      });
    });
  });
  
  router.get('/logout', (req, res) => {
    // Destroy the user's session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      // Redirect to the login page after logout
      res.redirect('/login');
    });
  });
  
module.exports = router;
