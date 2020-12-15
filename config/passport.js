const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy
var GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcryptjs');


const User = require('../model/User');
const Usergoogle = require('../model/Usergoogle');
const Usergithub = require('../model/Usergithub');
module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {

            User.findOne({ email: email })
                .then(user => {
                    if (!user) {
                        return done(null, false, { message: 'That email is not registered' });
                    }

                    //Match password

                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;

                        if (isMatch) {
                            return done(null, user);

                        } else {
                            return done(null, false, { message: 'Password-Incorrect' });
                        }

                    });


                })
                .catch(err => console.log(err));
        }));

    passport.use(
        new GoogleStrategy({
                clientID: '615337934160-dgi7p59te51rlt31juj9396ou03h97bb.apps.googleusercontent.com',
                clientSecret: 'lZ7_ooWpumiTkxDd09V7Dx1t',
                callbackURL: '/users/googleauth/callback',
            },
            async(accessToken, refreshToken, profile, done) => {
                const newUser = {
                    googleId: profile.id,
                    displayName: profile.displayName,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    image: profile.photos[0].value,
                }
                console.log("Yes");
                try {
                    let user = await Usergoogle.findOne({ googleId: profile.id })

                    if (user) {

                        done(null, user)
                    } else {

                        user = await Usergoogle.create(newUser)
                        done(null, user)
                    }
                } catch (err) {
                    console.error(err)
                }
            }
        )
    )


    passport.use(new GitHubStrategy({
            clientID: "74e832ac8cc6b95400d1",
            clientSecret: 'a00ad4aefd3bb958f8efa8caff3ba22647ba3ba0',
            callbackURL: "/users/githubauth/callback"
        },
        async(accessToken, refreshToken, profile, done) => {
            const newUser = {
                username: profile.username,
                id: profile.id,
                nodeId: profile.nodeId
            }

            try {
                let user = await Usergithub.findOne({ username: profile.username })
                console.log("Yes github");
                if (user) {

                    done(null, user)
                } else {

                    user = await Usergithub.create(newUser)
                    done(null, user)
                }
            } catch (err) {
                console.error(err)
            }
        }
    ));





    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });



}