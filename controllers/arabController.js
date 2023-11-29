// Import necessary modules
const express = require('express');
const PostModel = require('../models/postModel');
const { body, validationResult } = require('express-validator');
const path = require('path');
const router = express.Router();
const db = require('../db');
const app = express();
const fs = require('fs').promises; // Import the fs module
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// home route
router.get('', async(req, res) => {

    try {
        // Fetch some of the latest posts based on the provided limit
        const posts = await PostModel.getLatestPosts(3);
    
        // Render the view with the latest posts
        res.render('arab/index', { title: 'Jamia Markaz', posts });
      } catch (error) {
        console.error('Error fetching latest posts:', error);
        res.status(500).send('Internal Server Error');
      }
    
});

// All About routes

//founder
router.get('/founder', (req, res) => {
    res.render('arab/about/founder', { title: 'About : Jamia' });
});
//chancellor
router.get('/chancellor', (req, res) => {
    res.render('arab/about/chancellor', { title: 'About : Jamia' });
});
//administration
router.get('/administration', (req, res) => {
    res.render('arab/about/administration', { title: 'About : Jamia' });
});
//accreditation
router.get('/accreditation', (req, res) => {
    res.render('arab/about/accreditation', { title: 'About : Jamia' });
});


// All Program routes

//usul
router.get('/usul', (req, res) => {
    res.render('arab/kulliyya/usul', { title: 'Programs : Jamia' });
});
//sharia
router.get('/sharia', (req, res) => {
    res.render('arab/kulliyya/sharia', { title: 'Programs : Jamia' });
});
//dirasa
router.get('/dirasa', (req, res) => {
    res.render('arab/kulliyya/dirasa', { title: 'Programs : Jamia' });
});
//lugha
router.get('/lugha', (req, res) => {
    res.render('arab/kulliyya/lugha', { title: 'Programs : Jamia' });
});
//law
router.get('/law', (req, res) => {
    res.render('arab/kulliyya/law', { title: 'Programs : Jamia' });
});
//unani
router.get('/unani', (req, res) => {
    res.render('arab/kulliyya/unani', { title: 'Programs : Jamia' });
});
//arts
router.get('/arts', (req, res) => {
    res.render('arab/kulliyya/arts', { title: 'Programs : Jamia' });
});
// contact route
router.get('/contact', (req, res) => {
    res.render('arab/contact', { title: 'Contact' });
});
// Admission  route
router.get('/admission', (req, res) => {
    res.render('arab/admission', { title: 'Admission' });
});
// News  route
router.get('/news', async(req, res) => {

    const baseUrl = req.app.locals.baseUrl;
   
    try {
        // Fetch posts by the specified category
        const posts = await PostModel.getLatestPosts(25);
        // Fetch all post categories
        const categories = await PostModel.getAllCategories();
        res.render('arab/news', { posts, baseUrl, categories });
    } catch (error) {
        console.error('Error fetching post details:', error);
        res.status(500).send('Internal Server Error');
    }

});

// Example route to display a single post and other posts
router.get('/news/:id', async (req, res) => {
    const baseUrl = req.app.locals.baseUrl;
    const postId = req.params.id;
    try {
        // Fetch the details of the selected post
        const post = await PostModel.getPostById(postId);
        // Fetch other posts (you may want to limit the number of posts here)
        const otherPosts = await PostModel.getAllPostsExceptId(postId, 10);
        // Fetch the next and previous posts
        const nextPost = await PostModel.getNextPost(postId);
        const previousPost = await PostModel.getPreviousPost(postId);
        // Fetch all post categories
        const categories = await PostModel.getAllCategories();
        res.render('arab/newsSingle', { post, otherPosts, baseUrl, nextPost, previousPost, categories });
    } catch (error) {
        console.error('Error fetching post details:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Example route to display every  posts in a Category
router.get('/category/:category', async (req, res) => {
    const baseUrl = req.app.locals.baseUrl;
    const category = req.params.category;
    try {
        // Fetch posts by the specified category
        const posts = await PostModel.getPostsByCategory(category, 25);
        // Fetch all post categories
        const categories = await PostModel.getAllCategories();
        res.render('arab/newsCategory', { posts, baseUrl, categories });
    } catch (error) {
        console.error('Error fetching post details:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
