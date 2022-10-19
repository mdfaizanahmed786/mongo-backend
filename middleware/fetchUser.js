const jwt = require("jsonwebtoken");
// Now, we are creating a middleware that runs after request and before the actual response
// This middleware allows us to pass token, if the token is invalid or not provided it return some error
// after verifying, we pass the the data.user (sending that data initially while we were creating the token) to the req and then next() function is called, which invokes the next middleware.

const fetchUser = (req, res, next) => {
    try{
        const token = req.header("auth-token");
        if (!token) return res.status(401).send({success:false, message:"Authorization error"});
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data.user;

        next();
    }
    catch(er){
       res.status(401).send({success:false, message:"Authorization error"})
    }

};

module.exports = fetchUser;
