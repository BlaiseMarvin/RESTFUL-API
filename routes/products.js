const express=require('express');
const { route } = require('../app');
const mongoose=require('mongoose');
const Product = require('../models/products');
const router = express.Router();

router.get('/',(req,res,next)=>{
    Product.find().select('name price _id').
    exec().
    then(doc=>{const response ={
        count:doc.length,
        products:doc.map(doc=>{
            return{
                name:doc.name,
                price:doc.price,
                _id:doc._id,
                request:{
                    type:'GET',
                    url:'http://localhost:3000/products/' +doc._id
                }
            }

        })
    }
        res.status(200).json(response);}).
        catch(err=>{console.log(err);res.status(500).json({error:err});});
    
});

router.post('/',(req,res,next)=>{

    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name:req.body.name,
        price:req.body.price

    });

    product.save().then(result=>{console.log(result);
        res.status(201).json({message:"Handling POST requests to /products",
                        createdProduct:{
                            name:result.name,
                            price:result.price,
                            _id:result._id,
                            request:{
                                type:'POST',
                                url:'http://localhost:3000' +result._id
                            }

                        }
                    });
    }).catch(err=>{console.log(err);
       res.status(500).json({error:err})});
    
});

router.get('/:productID',(req,res,next)=>{
    const id = req.params.productID
    Product.findById(id).exec().
    then(doc=>
        {
           
            res.status(200).json({
                product:doc,
                request:{
                    type:'GET',
                    url:"http://localhost:3000/products" +doc._id
                }
            });
            if(doc) {
                res.status(200).json(doc);
            } else{
                res.status(404).json({message:"No valid entry found for provided ID"});
            }
        }).catch(err=>{console.log(err);res.status(500).json({error:err});});
    
   
    
});
router.patch('/:productID',(req,res,next)=>{

    const id = req.params.productID;
    //we should check whether we really wanna update both
    const updateOps = {};
    for (const ops of req.body) //iterate through the request body, get the key-value pairs, only these shou;d you update. don't just update fwaa
    {
        updateOps[ops.PropName]=ops.value;
    }
    Product.update({_id:id},{$set:updateOps}).exec().then(result=>{console.log(result);
    res.status(200).json(result);}).catch(err=>{
        console.log(err);
        res.status(500).json({error:err});
    });
});

router.delete('/:productID',(req,res,next)=>{
    const id = req.params.productID;
    Product.remove({_id:id}).exec().then(res=>{
        res.status(200).json({
            message:'Product deleted',
            request:{
                type:'POST',
                url:'http://localhost:3000/products',
                body:{name:'String',price:'Number'}
            }
        }); }).catch(err=>{console.log(err);
                            res.status(500).json({error:err});
                                                                });
});




module.exports=router;