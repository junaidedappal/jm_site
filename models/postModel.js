const db = require('../db'); 

// Fetch all posts from the database
const getAllPosts = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM posts';
    db.query(query, (err, posts) => {
      if (err) {
        reject(err);
      } else {
        resolve(posts);
      }
    });
  });
};

// Fetch some of the latest posts from the database
const getLatestPosts = (limit) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM posts ORDER BY id DESC LIMIT ${limit}`;
    db.query(query, (err, posts) => {
      if (err) {
        reject(err);
      } else {
        resolve(posts);
      }
    });
  });
};
// Fetch details of a specific post by ID
const getPostById = (postId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM posts WHERE id = ?';
    db.query(query, [postId], (err, post) => {
      if (err) {
        reject(err);
      } else {
        resolve(post && post.length ? post[0] : null);
      }
    });
  });
};

// Fetch the next post based on the current post's ID
const getNextPost = (postId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM posts WHERE id > ? ORDER BY id ASC LIMIT 1';
    db.query(query, [postId], (err, post) => {
      if (err) {
        reject(err);
      } else {
        resolve(post && post.length ? post[0] : null);
      }
    });
  });
};

// Fetch the previous post based on the current post's ID
const getPreviousPost = (postId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM posts WHERE id < ? ORDER BY id DESC LIMIT 1';
    db.query(query, [postId], (err, post) => {
      if (err) {
        reject(err);
      } else {
        resolve(post && post.length ? post[0] : null);
      }
    });
  });
};
// Fetch all posts from the database except the one with a specific ID
const getAllPostsExceptId = (postId, limit) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM posts WHERE id != ? LIMIT ?';
    db.query(query, [postId, limit], (err, posts) => {
      if (err) {
        reject(err);
      } else {
        resolve(posts);
      }
    });
  });
};


// Fetch all distinct categories from the database - Promises
const getAllCategories = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT DISTINCT category FROM posts';
    db.query(query, (err, categories) => {
      if (err) {
        reject(err);
      } else {
        resolve(categories);
      }
    });
  });
};
// Fetch posts by a specific category
const getPostsByCategory = (category,limit) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM posts WHERE category = ? LIMIT ?';
    db.query(query, [category, limit], (err, posts) => {
      if (err) {
        reject(err);
      } else {
        resolve(posts);
      }
    });
  });
};



module.exports = {
  getAllPosts,
  getPostById,
  getAllPostsExceptId,
  getNextPost,
  getPreviousPost,
  getAllCategories,
  getPostsByCategory,
  getLatestPosts
};




