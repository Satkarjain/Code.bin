const express = require('express');

const router = express.Router();

const bcrypt = require('bcryptjs');
// User
var User = require('../model/User');
const passport = require('passport');
const { Passport } = require('passport');

router.get('/login', (req, res) => res.render('login'));


router.get('/register', (req, res) => res.render('register'));


// Register Handle

router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;

    let errors = [];

    // Check required fields

    if (!name || !email || !password || !password2) {
        errors.push({ msg: "All fields are required!!" })
    }


    if (password2 != password) {
        errors.push({ msg: "Both password are not equal " });

    }


    // Check password length

    if (password.length < 6) {


        errors.push({ msg: "Password should be atleast 6 char " });

    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {


        // Validation passed

        User.findOne({ email: email })
            .then(user => {
                if (user) {

                    errors.push({ msg: "Email Id already exist.." });
                    //User exist
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });


                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });


                    // Hash Password

                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) => {

                            if (err) throw err;

                            newUser.password = hash;

                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered');
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err))


                        }))

                }

            });




    }


});




// Login 

router.post('/login', (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true

    })(req, res, next);

});

router.get('/googleauth', passport.authenticate('google', {
    scope: ['profile']

}))


router.get('/googleauth/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
        // Explicitly save the session before redirecting!
        req.session.save(() => {
            res.redirect('/dashboard');
        })
    }
)




router.get('/githubauth',
    passport.authenticate('github', { scope: ['user:email'] }));

router.get('/githubauth/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/dashboard');
    });




//Logout

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
})

module.exports = router;