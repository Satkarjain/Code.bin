const express = require('express');

const router = express.Router();

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
var async = require("async");
var nodemailer = require("nodemailer");
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


// Forgot password
router.get('/forgot',(req,res)=>{
    res.render('forgot');
});

router.post('/forgot',function(req,res,next){
    async.waterfall([
        function(done){
            crypto.randomBytes(20,function(err,buf){
                var token=buf.toString('hex');
                done(err,token);
            });
        },
        function(token,done){
            User.findOne({email:req.body.email},function(err,user){
                if(!user){
                    req.flash('error','No account with that email address exist');
                    return res.redirect('/forgot');
                }
                user.resetPasswordToken=token;
                user.resetPasswordExpires= Date.now()+3600000 //1hr

                user.save(function(err){
                    done(err,token,user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
              service: 'Gmail', 
              auth: {
                user: 'ajayjnvbanda@gmail.com',
                pass: process.env.GMAILPW
              }
            });
            var mailOptions = {
              to: user.email,
              from: 'ajayjnvbanda@gmail.com',
              subject: 'Node.js Password Reset',
              text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/users'+'/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
              console.log('mail sent');
              req.flash('success_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
              done(err, 'done');
            });
          }

    ],
    function(err){
        if(err)
        return next(err);
        res.redirect('/users/forgot');
    });
});

router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/users/forgot');
      }
      res.render('reset', {token: req.params.token});
    });
  });

  router.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }
          if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;

              bcrypt.genSalt(10, (err, salt) =>
              bcrypt.hash(req.body.password, salt, (err, hash) => {

                  if (err) throw err;

                  user.password = hash;

                  user.save()
                      .then(user => {
                          req.flash('success_msg', 'Your password have been changed');
                          res.redirect('/users/login');
                      })
                      .catch(err => console.log(err))


              }));
  
              
            })
          } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect('back');
          }
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'ajayjnvbanda@gmail.com',
            pass: process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'ajayjnvbanda@gmail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      res.redirect('/dashboard');
    });
  });


module.exports = router;