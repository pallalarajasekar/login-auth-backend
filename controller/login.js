require('dotenv').config();
const user = require("../model/login");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const saltRounds = 10;

const getUser = async () => {
    const loginUser = await user.find().exec();
    return loginUser;
}

const registerUser = async (username, email, password) => {
    const checkUser = await user.findOne({ email }).exec();
    if (!checkUser) {
        const hash = bcrypt.hashSync(password, saltRounds);
        const newUser = await new user({ username, email, password: hash }).save();
        const data = { status: 200, msg: "user register successfuly", newUser };
        return data;

    } else {
        const data = { status: 409, msg: "user already exit" };
        return data;
    }
}

const loginUser = async (email, password) => {
    const checkUser = await user.findOne({ email }).exec();
    if (checkUser) {
        const isUserPassword = bcrypt.compareSync(password, checkUser.password);
        if (isUserPassword) {
            const data = { status: 200, msg: "user is Authenticated" };
            return data;
        } else {
            const data = { status: 401, msg: "incorrect Password" };
            return data;
        }
    } else {
        const data = { status: 403, msg: "user does not exit" };
        return data;
    }
}

const forgotPassword = async (email) => {
    //console.log(email)
    const checkEmail = await user.findOne({ email }).exec();
    console.log(checkEmail);
    if (checkEmail) {

        var string = Math.random().toString(36).substr(2, 10);
        //console.log(string)

        const account = await nodemailer.createTestAccount();
        //console.log(account);
        const mailer = nodemailer.createTransport({
            name: 'gmail.com',
            host: "smtp.gmail.com",
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: {
                user: process.env.sender,
                pass: process.env.password
            }
        });

        let info = await mailer.sendMail({
            from: process.env.sender,
            to: checkEmail.email, // list of receivers
            subject: "Password Reset ✔", // Subject line
            text: "Password Reset Ramdom String",  // plain text body
            html: `<a href="https://hopeful-einstein-5a970a.netlify.app/reset/${email}/${string}">Click on this link</a>`,
        });
        const updateString = await user.updateOne({ email: checkEmail.email }, {
            randomString: string
        });
        //console.log("update string random" + updateString);
        const data = { status: 200, msg: "Check your email and reset your password", updateString };
        return data
    } else {
        const data = { status: 403, msg: "user does not registered" };
        return data;
    }

}

const verfiyString = async (email, randomString) => {
    const checkUser = await user.findOne({ email: email, randomString: randomString }).exec();
    console.log(checkUser);
    if (checkUser) {
        const data = { status: 200, msg: "string verified" };
        return data;
    } else {
        const data = { status: 403, msg: "reset url is expired" };
        return data;
    }
}

const resetPassword = async (email, password) => {

    const hash = bcrypt.hashSync(password, saltRounds);
    const updateString = await user.updateOne({ email: email }, {
        password: hash
    });

    const data = { status: 200, msg: "password updated successfully", updateString };
    return data;
}

const expireString = async (email) => {

    
    const expire_string = await user.updateOne({ email: email }, {
        randomString: ""
    });

    const data = { status: 200, msg: "Random String is expired", expire_string };
    //console.log(data);
}

module.exports = {
    getUser,
    registerUser,
    loginUser,
    forgotPassword,
    verfiyString,
    resetPassword,
    expireString
}