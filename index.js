const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { User } = require("./models/User")
const config = require('./config/key');

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, userUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send('Hello World!!!')
})

app.post('/register', (req, res) => {
    const user = new User(req.body)

    user.save((err, userInfo) => {
        if(err) return res.json({ success: false, err })
        console.log(userInfo);
        return res.status(200).json({
            success: true
        })
    })
})

app.post('/login', (req, res) => {

    // Find the email address in my DB
    User.findOne({ email: req.body.email}, (err, user) => {
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: "The email address is not exist"
            })
        }

        console.log("comparePassword");
        // Find the password in my DB
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch) return res.json({loginSuccess: false, message: 'The password is not exist'});

            console.log('Password is exist');

            // Generate token
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);

                // Save the token to cookie.
                res.cookie("x_auth", user.token)
                .status(200)
                .json({loginSuccess: true, userId: user._id});
            })
        })
    })

})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
