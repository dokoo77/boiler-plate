const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save', function(next) {
    var user = this;

    if(user.isModified('password')) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);

                // Store hash in your password DB.
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    } 
});

userSchema.methods.comparePassword = function(plainPassword, cb) {
    console.log("Comparing...");
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    })
}

userSchema.methods.generateToken = function(cb) {
    var user = this;

    // Generate token using jsonwebtoken
    var token = jwt.sign(user._id.toHexString(), 'secretToken'); // user._id + 'secretToken' = token
    user.token = token;
    user.save(function(err, user) {
        if(err) return cb(err);
        cb(null, user);
    })
}

userSchema.statics.findByToken = function(token, cb) {
    var user = this;

    // Decode a token.
    jwt.verify(token, 'secretToken', function(err, decoded) {
        // Find the user using user id and 
        // check whether it matches the token from client with the token from DB.
        user.findOne({'_id': decoded, 'token': token}, function(err, user) {
            if (err) return cb(err);
            cb(null, user);
        })
    });
}

const User = mongoose.model('User', userSchema);

module.exports = { User }