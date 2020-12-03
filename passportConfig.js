const User = require("./user");
const bcrypt = require("bcryptjs");
const localStrategy = require("passport-local").Strategy;

module.exports = function (passport) {
    passport.use(
        new localStrategy((username, password, done) => {
            User.findOne({ email: username }, (err, user) => {
                if (err) throw err;
                if (!user) return done(null, false);
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) throw err;
                    if (result === true) {
                        return done(null, user);
                    } else {
                        return done(null, false);
                    }
                });
            }).select('+password');
        })
    );

    passport.serializeUser((user, cb) => {
        cb(null, user.id);
    });
    passport.deserializeUser((id, cb) => {
        User.findOne({ _id: id }, (err, user) => {
            const userInformation = {
                email: user.email
            };
            cb(err, userInformation);
        });
    });
};

// const config = {
//     port: process.env.PORT || 3000,    
//     db: 'mongodb://localhost:27017/mydb',
//     mailerConfig: {
//         mailerService: 'gmail',
//         mailerUsername: secrets.mailerUsername,
//         mailerPassword: secrets.mailerPassword,
//     },
//     sessionConfig: {
//         name: 'blogSecurity',
//         resave: true,
//         saveUninitialized: true,
//         rolling: true,
//         cookie: {
//             httpOnly: false,
//             secure: false,
//             maxAge: 48 * 60 * 60 * 1000,
//         },
//     },
// };