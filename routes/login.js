var express = require('express');
var router = express.Router();

const { getUser, registerUser, loginUser, forgotPassword, verfiyString, resetPassword, expireString } = require("../controller/login");

/* GET users listing. */
router.get('/', async (req, res) => {
  try {
    const loginData = await getUser();
    res.status(200).json(loginData)
  } catch (error) {
    console.log(error);
    res.statusCode(500);
  }
});

router.post('/register', async(req, res) => {
  try {
    const { username, email, password } =  req.body
    const response = await registerUser(username, email, password);
    res.status(response.status).json(response.msg);
  } catch (error) {
    console.log(error);
    res.statusCode(500);
  }
})

router.post('/login', async(req, res) => {
    try {
      const { email, password } = req.body;
      const response =  await loginUser(email, password);
      res.status(response.status).json(response.msg);
    } catch (error) {
      console.log(error);
      res.statusCode(500);
    }
})

router.post('/forgot', async(req, res) => {
  try {
    const {email} = req.body;
    const response = await forgotPassword(email);
    res.status(response.status).json(response.msg);
    setTimeout(expireString, 300000, email);
  } catch (error) {
    console.log(error);
    res.statusCode(500);
  }
})

router.post('/verifyString', async(req, res) => {
  try {
    const {email, randomString} = req.body;
    const response = await verfiyString(email, randomString);
    res.status(response.status).json(response.msg);
  } catch (error) {
    console.log(error);
    res.statusCode(500);
  }
})

router.put('/reset', async(req, res) => {
  try {
    const {email, password} = req.body;
    const response = await resetPassword(email, password);
    res.status(response.status).json(response.msg);
  } catch (error) {
    console.log(error);
    res.statusCode(500);
  }
})

module.exports = router;
