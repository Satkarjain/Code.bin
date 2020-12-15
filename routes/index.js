const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
//Welcome
router.get('/', (req, res) => res.render('welcome'));




router.get('/dashboard', ensureAuthenticated, async(req, res) => res.render('dashboard'));



module.exports = router;