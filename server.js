const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
const User = require("./user");
const Expertise = require('./expertise');
const dotenv = require("dotenv");
dotenv.config();

const mongouser = process.env.USERNAME;
const mongopassword = process.env.PWORD;

mongoose.connect(
    `mongodb+srv://${mongouser}:${mongopassword}@cluster0.250hr.mongodb.net/test?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => {
        console.log("Mongoose Is Connected");
    }
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    cors({
        origin: "http://localhost:3000", // <-- location of the react app were connecting to
        credentials: true,
    })
);
app.use(
    session({
        secret: "secretcode",
        resave: true,
        saveUninitialized: true,
    })
);
app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

app.use((error, req, res, next) => {
  return res.status(500).json({ error: error.toString() });
});

// Routes********
app.get('/logout', (req, res) => {
    req.logout();
    res.send('Logged out successfully');
});

// User
app.post('/login', (req, res, next) => {
     
    passport.authenticate('local', async (err, user, info) => {   
        if(err) {
            console.log('err',err)
            // throw err;
            res.status(400).json({ error: err.toString() });
            res.send({ error: err.toString() })
        }
        if(!user) {
            const message = 'Wrong username or password'
            // res.status(400)
            // return res.send({ error: message });
            return res.status(401).send(message);
        }
        else {
            req.logIn(user, (err) => {
                if (err) throw err;
                console.log("Successfully Authenticated");
                // res.send(req.user);
                const payload = {
                    user: {
                        id: req.user.id,
                        firstName: req.user.firstName,
                        lastName: req.user.lastName,
                        website: req.user.website,
                        location: req.user.location,
                        linkedIn: req.user.linkedIn,
                        summary: req.user.summary,
                        expertise: req.user.expertise
                    }
                }

                jwt.sign(
                    payload,
                    "randomString", {
                        expiresIn: 10000
                    },
                    (err, token) => {
                        if (err) throw err;
                        res.status(200).json({
                            ...payload,
                            token
                        });
                    }
                );
            });
        }
    })(req, res, next);
});

app.post('/signup', (req, res) => {
    User.findOne({ email: req.body.email }, async (err, doc) => {
        if(err) throw err;
        if(doc) res.send('User already exits. Try another email');
        if(!doc) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const newUser = new User({
                email: req.body.email,
                password: hashedPassword,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                website: req.body.website,
                location: req.body.location,
                linkedIn: req.body.linkedIn,
                summary: req.body.summary,
                expertise: req.body.expertise
            });

            await newUser.save();
            res.send({message: 'Signed up successfully'});
        }
    });
});

app.get('/user', (req, res) => {
    // const user = await User.findOne({email: newUser.email}).select("-password");
    res.send(req.user);
})
// User

// Expertise
app.put('/expertise', (req, res) => {
    Expertise.updateOne({
        id: req.id
    },
    { $addToSet: { users: req.user_id }},
    async (err, doc) => {
        if(err) throw err;
        if(doc) {
            res.send('Name does not exist');
        } else {
            res.send(doc);
        }
    }
    )
});

app.get('/expertise', (req, res) => {
    Expertise.find({}, 'name', (err, expertise) => {
        if(err) throw err;
        if(!expertise) {
            res.send('Doc does not exist');
        } else {
            res.send(expertise);
        }
    })
})

app.post('/expertise', (req, res) => {
    Expertise.findOne({ name: req.body.name }, async (err, doc) => {
        if(err) throw err;
        if(doc) res.send('Name already exists.');
        if(!doc) {
            const newExpertise = new Expertise({
                name: req.body.name,
                users: []
            });

            await newExpertise.save();
            res.send({message: 'Creation Successful'});
        }
    });
});
// Expertise

app.listen(4040, () => {
    console.log('Server has started.')
});