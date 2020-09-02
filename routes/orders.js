const express = require('express');
const mongoose = require('mongoose');

const Order = require('../models/orders');
const Product = require('../models/products');

const router = express.Router();

router.get('/',(req,res,next)=>{
    Order.find()
    .select('product quantity _id')
    .populate('product')
    .exec()
    .then(docs=>{
        res.status(200).json({
            count:docs.length,
            orders:docs.map(doc=>{
                return{
                    _id:doc._id,
                    product:doc.product,
                    quantity:doc.quantity,
                    request:{
                        type:'GET',
                        url:"http://localhost:3000/orders/" +docs._id
                    }
                }
            })
        });
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        });
    })
})

router.post('/',(req,res,next)=>{
    Product.findById(req.body.product)
    .then(product=>{
        if(!product)
        {
            return res.status(404).json(
                {
                    message:"product not found"
                }
            );
        }
        const order = new Order({
        _id:mongoose.Types.ObjectId(),
        quantity:req.body.quantity,
        product:req.body.product //this ought to be the ID of the product we are connected to
    }
    
    );

    return order.save()
    
})
.then(result=>{
    console.log(result);
    res.status(200).json({
        message:"Order stored",
        createdOrder:{
            _id:result._id,
            product:result.product,
            quantity:result.quantity

        },
        request:{
            type:"GET",
            url:"http://localhost:3000" +result._id
        }
    });
})
    
    .catch(err=>{
        res.status(500).json({
            message:"Product not found"
        });
    })
    
    

    
    
});

router.get('/:orderID',(req,res,next)=>{
    Order.findById(req.params.orderID)
    .populate('product')
    .exec()
    .then(order=>{
        res.status(200).json({
            order:order,
            request:{
                type:'GET',
                url:'http://localhost:3000/orders'
            }
        })
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        });
    });
});

router.delete('/:orderID',(req,res,next)=>{
    const id = req.params.orderID;
    Order.remove({_id:id})
    .exec()
    .then(result=>{
        if (!result)
        {
            return res.status(404).json({
                message:"order not found"
            })
        }
        result.status(200).json({
            message:'Order deleted',
            request:{
                type:"POST",
                url:'http://locahost:3000/orders',
                body:{productId:'ID',quantity:'Number'}

            }
        });
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        });
    })
    
});

module.exports=router;