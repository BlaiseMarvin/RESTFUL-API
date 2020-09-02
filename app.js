const express=require('express');
const morgan = require('morgan');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');

const app = express();

const productRoutes=require('./routes/products');

const orderRoutes=require('./routes/orders');

mongoose.connect('mongodb+srv://node-shop-rest:'+ process.env.MONGO_ATLAS_PW +'@node-rest-shop.eceo2.mongodb.net/<dbname>?retryWrites=true&w=majority',{
    userMongoClient:true
});

mongoose.Promise = global.Promise;

app.use(morgan('dev')); // morgan is middleware, takes in all requests and logs, and passes the next function
app.use(bodyParser.urlencoded({extended:false}));//this is middleware to parse the body of incoming text to what the program understands
//here we are allowing the program to prase url encoded stuff, and by setting extended to false, we dont wanna parse extended urls

app.use(bodyParser.json()); //parse json

//we now extract json and url encoded data and make it easily readable

//to now prevent CORS errors we use the code below:

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*'); //allow headers from all origins. '* specifies all
    res.header('Access-Control-Allow-Headers,Origin,X_Requested-With,Content-Type,Accept,Authorization');

    //so that all these headers can be appended to an incoming request

    if(req.method ==='OPTIONS')
    {
        res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});



app.use('/products',productRoutes);
app.use('/orders',orderRoutes);

app.use((req,res,next)=>{
    const error = new Error('Not found');
    error.status=404;
    next(error);
});

app.use((error,req,res,next)=>{
    res.status(error.status||500)
    res.json({
        error:{
            message:error.message
        }
    });
});




module.exports=app; //we can export this file