const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const fetchUser = require("../middleware/fetchUser");

//ROUTE 1: Now creating a user with post request(No login required)
// using express validator as package, everything we are exporting from the documentation
router.post(
  "/createUser",
  [
    body("email", "Enter a valid email").isEmail(),
    // password must be at least 5 chars long
    body("password", "Password is too short").isLength({ min: 5 }),
    body("age", "Enter valid age").isLength({ min: 1 }),
  ],
  async (req, res) => {
    //   creating user from post request

    // if errors are there, express validator, sends us some error in array format.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success: false, errors: errors.array() });
    }

    // if the user already exists with that email, then return from it immediately.
    let existingUser = await User.exists({ email: req.body.email });
    if (existingUser) {
      return res
        .status(400)
        .json({success:false, error: "Sorry, user already exists with that email" });
    }
    try {
      // this is from the documentation of express validator we can even use async await and save user using user.save()
      //   Now using bcrypt to generate hashed password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      let user = await User.create({
        name: req.body.name,
        age: req.body.age,
        email: req.body.email,
        password: hashedPassword,
      });
      // Now, we are going to implement JWT authentication. So, whenever user is logged in or a new user is created through the above route, instead of sending the entire information of user, I'll sign the token with my secret and send it back to the user, in this way the user can visit my protected routes and I can verify it for every subsequent request. If the user tries to change the data, I can easily verify it as I signed it. So, basically it allows us a secure connection between server and user.

      const data = {
        user: { id: user.id },
      };

      // jwt sign need an argument and a secret. It returns me a token and in that the data will be the above specified data. With that secret I can identify whether the data is tampered or not.
      const authToken = jwt.sign(data, process.env.JWT_SECRET);

      //   sending back that token to the server.
      
      res.json({success:true, authToken });
    } catch (err) {
      // catching some server error, if there is any.
      res.status(500).json({success:false, error: "Internal Server Error" });
    }
  }
);

//ROUTE 2: now creating route for login in user
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password is too short").isLength({ min: 1 }),
  ],
  async (req, res) => {
    //   now we are actually checking the authorization of user

    // if errors are there, express validator, sends us some error in array format.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success:false, errors: errors.array() });
    }
    // destructuring from the body
    const { email, password } = req.body;

    try {
      //  checking for valid email

      let user = await User.findOne({ email });

      if (!user)
        return res
          .status(400)
          .json({success:false, error: "Please enter valid credentials" });

      // Now checking for the passwords
      let validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword)
        return res
          .status(400)
          .json({success:false, error: "Please enter valid credentials" });

      //   if the user enters valid credentials, create a token and send him/she back.
      const data = {
        user: { id: user.id },
        // getting user id if the credentials are correct.
      };
      const authToken = jwt.sign(data, process.env.JWT_SECRET);

      //   sending back that token to the server.
      res.json({success:true, authToken });
    } catch (err) {
      res.status(500).json({success:false, error: "Internal Server Error" });
    }
  }
);

// get user data from auth token
// // ROUTE 3: This route gives the details of our user.
// we are using a middleware to fetch the user information and like this we can protect our routes from invalid users.
router.post("/getUser", fetchUser, async (req, res) => {
  try {
    // getting the id, which we provided in the middleware i.e req.user
    const id = req.user.id;

    // now, finding the user by id and removing the password field from it.
    const user = await User.findById(id).select("-password");

    // sending user information after successful verification of the token.
    res.status(200).send({success:true,user});
  } catch (er) {
    res.status(500).send({success:false, error: "Internal Server Error" });
  }
});


module.exports = router;
