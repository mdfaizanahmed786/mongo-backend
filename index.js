const express=require('express');
const mongooseConnect=require('./db.js');
const app=express();
const cors=require('cors')

// using a middleware to parse the body in JSON.
app.use(express.json());
app.use(cors())

// connecting mongoose importing from db.js
mongooseConnect();

// providing the routes to the paths i.e for auth and notes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.get('/', (req,res)=>{
	res.json({success:'success'})
})


// app.get('/', (req,res)=>{
// 	res.send("Hello I'm billi");
// });


app.listen(process.env.PORT || 6000, ()=>{
	console.log("listening to the server");
});

