const { User } = require('../models/User');

let auth = (req, res, next) => {
    // Authentication processing

    // Get a token from client cookie using cookie parser.
    let token = req.cookies.x_auth;

    // console.log(req.cookies.x_auth);
    // Decrypt the token and find the user.
    User.findByToken(token, (err, user) => {
        if (err) throw err;
        // If there is not the user, then the authentication is fail.
        if (!user) return res.json({ isAuth: false, error: true});

        // If there is the user, then the authentication is success.
        req.token = token;
        req.user = user;
        next();
    })
}

module.exports = { auth };