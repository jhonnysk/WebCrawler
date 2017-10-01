var order = require('../models/orderSchema').Order;
var shoppingBag = require('../models/orderSchema').ShoppingBag;
var product = require('../models/productSchema').Product;
var vendor = require('../models/adminSchema').Vendor;
var async = require('async');
module.exports = function(router,io) {

    router.post('/orderSave', function(req, res) {

        var date = new Date();
        var time = date.getTime();
        var orderId = time.toString().substring(4);
        var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        
        var orderSave = new order();
        orderSave.orderId = Number(orderId);
        orderSave.addedOn = new Date(addedOnDate).toISOString();
        orderSave.addedOnDateTime=new Date().toISOString();
        
        async.each(req.body.cart,function(item,callback){
            vendor.findOne({_id:item.vendorInfo.id},function(err,v){
                if(v){
                item.commissionObj={};
                item.commissionObj.percent=(v.commission.status=='pending'?v.commission.prevCommission : v.commission.newCommission);
                item.commissionObj.adminCredit=(item.salePrice*item.qty*item.commissionObj.percent/100);
                item.commissionObj.adminCredit=Number(item.commissionObj.adminCredit.toFixed(0));
                item.commissionObj.vendorCredit=(item.salePrice*item.qty)- item.commissionObj.adminCredit;
                 item.commissionObj.vendorCredit=Number(item.commissionObj.vendorCredit.toFixed(0));
                 
                 callback();
                }
            });
        },function(err){
        orderSave.productList = req.body.cart;
        orderSave.userRef = req.body.user;
        orderSave.shippingAddress = req.body.userShippingAddress;

        orderSave.save(function(err, data) {
            var orders = data;
            var global;
            var allProduct;
            async.each(orders.productList, function(eachProduct, callback) {

                    product.findOne({
                        _id: eachProduct.prodId
                    }, function(err, p) {

                        var totalQty=0;

                        for(var i=0;i<orders.productList.length;i++){
                            if(orders.productList[i].prodId==eachProduct.prodId){
                                totalQty+=orders.productList[i].qty;
                                for(var j=0;j<p.singleQty.length;j++){
                                    if(p.singleQty[j]._id==orders.productList[i].prodTrack_id){
                                        p.singleQty[j].qty=p.singleQty[j].qty-orders.productList[i].qty;
                                        p.singleQty[j].qty=(p.singleQty[j].qty<0 ? 0: p.singleQty[j].qty);                   
                                    }
                                }
                            }
                        }
                         p.totalSale = p.totalSale +totalQty;
                         product.update({
                                    _id: eachProduct.prodId
                                }, {
                                    $set: {
                                        'singleQty': p.singleQty,
                                        'totalSale': p.totalSale
                                    }
                                }, function(err, qtyUpdate) {
                                    console.log(qtyUpdate);
                                        callback();
                                });
                        
                    });

                }, function(err) {
                        res.send({
                        msg: 'Order Saved'
                        });
                        io.sockets.emit('welcome');
                    }); 
            });
        });        
        
    });

    router.post('/wishlistSave', function(req, res) {

        var date = new Date();
        var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        
        var wishlist = new shoppingBag();

        wishlist.addedOnDateTime=new Date().toISOString();
       
        wishlist.addedOn = new Date(addedOnDate).toISOString();
        wishlist.productRef = req.body.prod;
        wishlist.userRef = req.body.user;
        wishlist.wishlistFlag=1;

        wishlist.save(function(err, data){
            //console.log(data);
            if(data){
                 shoppingBag.findOne({userRef:req.body.user}).sort({addedOnDateTime:-1}).populate('productRef').
                 exec(function(err,p){
                    res.send(p);
                 });
            }
           
            
        })

    });

    router.get('/getWishlist/:userId', function(req, res){
        shoppingBag.find({
            userRef: req.params.userId,
            wishlistFlag: 1
        }).sort({
            addedOnDateTime:-1
        }).populate('productRef').exec(function(err, data){
           
            res.send(data);
        })
    });

    router.get('/getCart/:userId', function(req, res){
        shoppingBag.find({
            userRef: req.params.userId,
            cartFlag: 1
        }).sort({
            addedOnDateTime:-1
        }).populate('productRef').exec(function(err, data){
            res.send(data);
        })
    });

      router.post('/clearCart/:userId', function(req, res){
           shoppingBag.remove({
            userRef: req.params.userId,
            cartFlag: 1
        }, function(err, data) {
            res.send({
                Delete: true
            });
        });
    });



        router.post('/wishToCart/:id', function(req, res){
         shoppingBag.update({
            _id: req.params.id
        }, {
            $set: {
                wishlistFlag: 0,
                cartFlag: 1
            }
        }, function(err, data) {
            if (err) console.log(err);
            res.send(data);
        });
    });

    router.post('/cartSave', function(req, res) {
        var cartId;
        async.each(req.body.cart,function(eachItem,callback){
             var date = new Date();
             var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
             var cartUser = new shoppingBag();
            cartUser.addedOnDateTime=new Date().toISOString();
            cartUser.addedOn = new Date(addedOnDate).toISOString();
            cartUser.userRef = req.body.user;
            cartUser.cartFlag = 1;
            cartUser.productRef = eachItem.prodId;
            cartUser.cartInfo=eachItem;
            shoppingBag.remove({userRef:req.body.user,'cartInfo.prodTrack_id':eachItem.prodTrack_id},function(err,del){
                cartUser.save(function(err, data){ 
                    cartId=data._id;
                        shoppingBag.remove({
                            userRef: req.body.user,productRef: eachItem.prodId,wishlistFlag:1
                            }, function(err, data) {
                                callback();
                        });
                }) 
            });
        },function(err){
                    res.send(cartId);                    
        })
        // for(var i=0;i<req.body.cart.length;i++){
        //     var date = new Date();
        // var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        
        // var cartUser = new shoppingBag();

        // cartUser.addedOnDateTime=new Date().toISOString();
       
        // cartUser.addedOn = new Date(addedOnDate).toISOString();
        // cartUser.userRef = req.body.user;
        // cartUser.cartFlag = 1;
        // cartUser.productRef = req.body.cart[i].prodId;
        // cartUser.cartInfo=req.body.cart[i];

        // shoppingBag.remove({
        //         userRef: req.body.user,productRef: req.body.cart[i].prodId,wishlistFlag:1
        //         }, function(err, data) {
        //     });

        // cartUser.save(function(err, data){
            
        //     if(data){
        //         if(req.body.cart.length<2){
        //                 res.send(data._id);
        //         }
        //     }
            
        // })
        // }

    });

    router.post('/cartUpdate', function(req, res) {
            shoppingBag.update({
                _id: req.body._id
            }, {
                $set: {
                    'cartInfo.qty': req.body.qty

                }
            }, function(err, qtyUp) {
                res.send({msg:"Qty update"});
            });
                        /////////////////////////
    });
    
    router.post('/removeShoppingItem/:id', function(req, res){
           shoppingBag.remove({
            _id: req.params.id
        }, function(err, data) {
            res.send({
                Delete: true
            });
        });

    });
    router.get('/allOrders', function(req, res) {

        order.find({
            }).sort({
                addedOnDateTime: -1
            })
            .populate('userRef').exec(function(err, data) {
                res.send({
                    orders: data,
                });
            });
    });


  router.post('/userOrders', function(req, res) {

        var orderObj = [];
        order.find({
                'userRef': req.body.userId
            },{addedOnDateTime:1,orderId:1,status:1}).sort({
                addedOnDateTime: -1
            }).exec(function(err, data) {
                res.send({
                    orders: data,
                });
            });
    });

  router.post('/returnProd', function(req, res) {
     var date = new Date();
        var returnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        order.findOne({_id:req.body.order_id},function(err,o){
            var updateOrderList=[];
            if(o){
                for(var i=0;i<o.productList.length;i++){
                    if(o.productList[i].prodTrack_id==req.body.prodTrack_id){
                        o.productList[i].returnObj={};
                        o.productList[i].returnObj.status1="return";
                        o.productList[i].returnObj.returnQty=req.body.qty;
                        o.productList[i].returnObj.returnDate=returnDate;
                        o.productList[i].returnObj.returnDateTime=new Date().toISOString();
                        
                        o.productList[i].returnObj.returnAns=(!req.body.returnAns ? "Returned On Delivery" : req.body.returnAns);
                    }
                }
                updateOrderList=o.productList;
                order.update({_id:req.body.order_id},{$set:{productList:updateOrderList}},function(err,uo){
                    res.send({msg:"Return Success"});
                    product.findOne({'singleQty._id':req.body.prodTrack_id},function(err,p){
                        if(p){
                            for(var i=0;i<p.singleQty.length;i++){
                                if(p.singleQty[i]._id==req.body.prodTrack_id){
                                    p.singleQty[i].qty+=req.body.qty;
                                }
                            }
                           product.update({'singleQty._id':req.body.prodTrack_id},{$set:{singleQty:p.singleQty}},function(err,up){
                            console.log(up);
                           }) 
                        }
                    });
                });
            }
            else{
                res.send({msg:"No Order Found"});
            }
        })
    });

}