"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: './.env' });
const jwt = require("jsonwebtoken");
const verifyLogin = (req, res, next) => {
    let token = req.cookies.access_token;
    if (token == null || !token) {
        return res.redirect('/login');
    }
    try {
        req.body.user = jwt.verify(token, process.env.JWT_SECRET_KEY);
    }
    catch (err) {
        return res.redirect('/login');
    }
    return next();
};
module.exports = verifyLogin;
