require('dotenv').config({path: './.env'});
import express, {Request, Response} from 'express';
const jwt = require("jsonwebtoken");

const verifyLogin = (req: Request, res: Response, next: any) => {
    let token = req.cookies.access_token;
    if (token == null || !token) {
        return res.redirect('/login');
    }
    try {
        req.body.user = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err: any) {
        return res.redirect('/login');
    }
    return next();
};

module.exports = verifyLogin;
