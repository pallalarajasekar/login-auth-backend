require('dotenv').config();
const user = require("../model/login");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const saltRounds = 10;

const getUser = async () => {
    const loginUser =  await user.find().exec();
    return loginUser;
}

const registerUser = async (username, email, password) =>{
    const checkUser = await user.findOne({ email }).exec();
    if(!checkUser){
        const hash = bcrypt.hashSync(password, saltRounds);
        const newUser = await new user({ username, email, password: hash}).save();
        const data = {status: 200, msg: "user register successfuly", newUser };
        return data;        

    }else{
        const data = {status: 409, msg: "user already exit"};
        return data;
    }
}

const loginUser = async (email, password) => {
    const checkUser = await user.findOne({email}).exec();
    if(checkUser){
        const isUserPassword = bcrypt.compareSync(password, checkUser.password);
        if(isUserPassword){
            const data = {status: 200, msg: "user is Authenticated"};
            return data;
        }else{
            const data = {status: 401, msg: "incorrect Password"};
            return data;
        }
    }else{
        const data = {status: 403, msg: "user does not exit"};
        return data;
    }
}

const forgotPassword = async (email) =>{
    console.log(email)
    const checkEmail = await user.findOne({email}).exec();
    console.log(checkEmail);
    if(checkEmail){
        
        var string = Math.random().toString(36).substr(2, 10);
        console.log(string)
        
        const account = await nodemailer.createTestAccount();
        console.log(account);
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
        from: process.env.sender ,
        to: "tdemo0137@gmail.com", // list of receivers
        subject: "Password Reset ✔", // Subject line
        text: "Password Reset Ramdom String",  // plain text body
        html: `<a href="https://localhost:8080/auth/${email}/${string}">Click on this link ${string}</a>`,
      });

      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      const updateString = await user.updateOne({ email: checkEmail.email }, {
        randomString: string
      });
      console.log("update string random" +updateString);
      const data = {status: 200, msg: "Check your email and reset your password", updateString};
      return data
    }else{
        const data = {status: 403, msg: "user does not registered"};
        return data;
    }

}

module.exports = {
    getUser,
    registerUser,
    loginUser,
    forgotPassword
}