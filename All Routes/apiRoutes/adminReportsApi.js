var product = require('../models/productSchema').Product;
var Admin = require('../models/adminSchema').Admin;
var vendor = require('../models/adminSchema').Vendor;
var orders = require('../models/orderSchema').Order;
var User = require('../models/userSchema').User;
var mongoose = require('mongoose');
var async = require("async");

module.exports = function(router) {
    
    // ***********************All Posts Starts *********************
    router.post('/allUsersByDate', function(req, res) {
        console.log(req.body);
        var fromDate=new Date(req.body.fromDate);
        var toDate=new Date(req.body.toDate);
        fromDate=fromDate.getFullYear()+'-'+(fromDate.getMonth()+1)+'-'+fromDate.getDate();
        fromDate=new Date(fromDate).toISOString();
        toDate=toDate.getFullYear()+'-'+(toDate.getMonth()+1)+'-'+toDate.getDate();
        toDate=new Date(toDate).toISOString();

        User.find({
            addedOn: {
                $gte: new Date(fromDate),
                $lte: new Date(toDate)
            }
        }, {
            _id: 1,
            addedOn: 1,
            addedOnDateTime:1,
            'personalInfo.firstName': 1,
            'personalInfo.lastName': 1
        }).sort({addedOn:-1}).exec(function(err, data) {
            if (err) console.log(err);
           
            res.send({
                users: data
            });
        });
        
    });


    router.post('/allVendorsByDate', function(req, res) {
        var fromDate=new Date(req.body.fromDate);
        var toDate=new Date(req.body.toDate);
        fromDate=fromDate.getFullYear()+'-'+(fromDate.getMonth()+1)+'-'+fromDate.getDate();
        fromDate=new Date(fromDate).toISOString();
        toDate=toDate.getFullYear()+'-'+(toDate.getMonth()+1)+'-'+toDate.getDate();
        toDate=new Date(toDate).toISOString();
       
        vendor.find({
            'accessRight.restricted': false,
            'accessRight.activated': true,
            activatedOn: {
                $gte: new Date(fromDate),
                $lte: new Date(toDate)
            }
        }, {
            _id: 1,
            activatedOn: 1,
            'vendorBussDesc.brandName': 1,
            addedOnDateTime: 1
        }).sort({
            addedOnDateTime: -1
        }).exec(function(err, data) {
            res.send(data);
        })

        
    });

    router.post('/allProductsByDate', function(req, res) {
        var populateQuery = [
                         {path:'Taxonomy.parent'},
                         {path:'Taxonomy.parentCategory'},
                         {path:'Taxonomy.subCategory'}
                              ];

         var fromDate=new Date(req.body.fromDate);
        var toDate=new Date(req.body.toDate);
        fromDate=fromDate.getFullYear()+'-'+(fromDate.getMonth()+1)+'-'+fromDate.getDate();
        fromDate=new Date(fromDate).toISOString();
        toDate=toDate.getFullYear()+'-'+(toDate.getMonth()+1)+'-'+toDate.getDate();
        toDate=new Date(toDate).toISOString();

        if (req.body.user.userId)
            Admin.findOne({
                _id: req.body.user.userId
            }, function(err, data) {
                if (err) console.log(err);
                if (!data) {
                    product.find({
                            addedOn: {
                                $gte: new Date(fromDate),
                                $lte: new Date(toDate)
                            },
                            'Details.manufacturedBy.id': req.body.user.userId
                        }, {
                            name: 1,
                            addedOn: 1,
                            'Details.manufacturedBy': 1,
                            'Taxonomy.parent': 1,
                            'Taxonomy.parentCategory':1,
                            'Taxonomy.subCategory':1,
                            addedOnDateTime: 1
                        }).sort({
                            addedOnDateTime: -1
                        })
                        .populate(populateQuery).exec(function(err, data) {
                            //console.log(data);
                            res.send({
                                products: data
                            });
                        });
                } else {
                    product.find({
                            addedOn: {
                                $gte: new Date(fromDate),
                                $lte: new Date(toDate)
                            }
                        },
                        {
                             name: 1,
                            addedOn: 1,
                            'Details.manufacturedBy': 1,
                            'Taxonomy.parent': 1,
                            'Taxonomy.parentCategory':1,
                            'Taxonomy.subCategory':1,
                            addedOnDateTime: 1
                        }).sort({
                            addedOnDateTime: -1
                        })
                        .populate(populateQuery).exec(function(err, data) {
                            //console.log(data);
                            res.send({
                                products: data
                            });
                        });
                }
            });


        ///////////////////////////////////////////////
    });


    router.post('/allOrdersByDate', function(req, res) {
        var fromDate=new Date(req.body.fromDate);
        var toDate=new Date(req.body.toDate);
        fromDate=fromDate.getFullYear()+'-'+(fromDate.getMonth()+1)+'-'+fromDate.getDate();
        fromDate=new Date(fromDate).toISOString();
        toDate=toDate.getFullYear()+'-'+(toDate.getMonth()+1)+'-'+toDate.getDate();
        toDate=new Date(toDate).toISOString();
       
        Admin.findOne({
            _id: req.body.user.userId
        }, function(err, a) {
            if (!a) {
                // ****************************

                orders.aggregate([
                    {
                         $match: {
                                "addedOn": {
                                    // $gte: new Date(prevDateMsg)
                                   $gte: new Date(fromDate),
                                $lte:new Date(toDate)    
                                    
                                }
                                
                            }
                    },
                    {
                            $sort: {
                                addedOnDateTime: 1
                            }
                        }, {
                            $unwind: "$productList"
                        }, {
                            $match: {

                                "productList.vendorInfo.id": req.body.user.userId
                            }
                        },
                        {
                            $group: {
                                _id: {orderId:"$orderId",addedOnDateTime:"$addedOnDateTime",status:"$status",
                                        commissionPercent:'$productList.commissionObj.percent',vendor:"$productList.vendorInfo.brand"},
                                totalAmount: {
                                    $sum: {
                                        $multiply: ["$productList.salePrice", "$productList.qty"]
                                    }
                                },
                                vendorCredit:{
                                    $sum:'$productList.commissionObj.vendorCredit'
                                },
                                adminCredit:{
                                    $sum:'$productList.commissionObj.adminCredit'
                                }
                            }
                        }

                    ],
                    function(err, data) {
                        res.send(data);
                    });
                // ****************************
            } else {
                // ****************************

                orders.aggregate([
                    {
                         $match: {
                                "addedOn": {
                                    // $gte: new Date(prevDateMsg)
                                   $gte: new Date(fromDate),
                                $lte:new Date(toDate)    
                                    
                                }

                            }
                    },
                        {
                            $sort: {
                                addedOnDateTime: 1
                            }
                        }, {
                            $unwind: "$productList"
                        },
                        {
                            $group: {
                                _id: {orderId:"$orderId",addedOnDateTime:"$addedOnDateTime",status:"$status",
                                        commissionPercent:'$productList.commissionObj.percent',vendor:"$productList.vendorInfo.brand"},
                                totalAmount: {
                                    $sum: {
                                        $multiply: ["$productList.salePrice", "$productList.qty"]
                                    }
                                },
                                vendorCredit:{
                                    $sum:'$productList.commissionObj.vendorCredit'
                                },
                                adminCredit:{
                                    $sum:'$productList.commissionObj.adminCredit'
                                }
                            }
                        }

                    ],
                    function(err, data) {
                        res.send(data);
                    });
                // ****************************
            }
        })


    });

    router.post('/getDispatchProducts', function(req, res) {
        var fromDate=new Date(req.body.fromDate);
        var toDate=new Date(req.body.toDate);
        fromDate=fromDate.getFullYear()+'-'+(fromDate.getMonth()+1)+'-'+fromDate.getDate();
        fromDate=new Date(fromDate).toISOString();
        toDate=toDate.getFullYear()+'-'+(toDate.getMonth()+1)+'-'+toDate.getDate();
        toDate=new Date(toDate).toISOString();
       
        Admin.findOne({
            _id: req.body.user.userId
        }, function(err, a) {
            if (!a) {
                // ****************************

                orders.aggregate([
                    {
                         $match: {
                            "productList.vendorInfo.id": req.body.user.userId,
                            'productList.dispatch':true,
                            "addedOn": {$gte: new Date(fromDate),$lte:new Date(toDate)}
                                
                            }
                    },
                    {
                            $sort: {
                                addedOnDateTime: 1
                            }
                        }, {
                            $unwind: "$productList"
                        }, {
                            $match: {

                                "productList.vendorInfo.id": req.body.user.userId,
                                'productList.dispatch':true
                            }
                        },
                        {
                            $group: {
                                _id: {id:"$_id",orderId:"$orderId",addedOnDateTime:"$addedOnDateTime",
                                        products:'$productList'}
                            }
                        }

                    ],
                    function(err, data) {
                        var disPatchProd=data;
                        var prodInfo=[];
                        async.each(data,function(p,callback){
                            product.findOne({_id:p._id.products.prodId},{'ProductImages.productmainImage':1},function(err,prod){
                                prodInfo.push(prod);
                                callback();
                            });
                        },function(err){
                            res.send({
                                disPatchProd:disPatchProd,
                                prodInfo:prodInfo
                            });
                        });
                    });
                // ****************************
            } else {
                // ****************************

                orders.aggregate([
                    {
                         $match: {
                                "addedOn": { $gte: new Date(fromDate),$lte:new Date(toDate)},
                                'productList.dispatch':true
                            }
                    },
                        {
                            $sort: {
                                addedOnDateTime: 1
                            }
                        }, {
                            $unwind: "$productList"
                        },
                        {
                            $match: {
                                'productList.dispatch':true
                            }
                        },
                         {
                            $group: {
                                _id: {id:"$_id",orderId:"$orderId",addedOnDateTime:"$addedOnDateTime",
                                        products:'$productList'}
                            }
                        }

                    ],
                    function(err, data) {
                        //res.send(data);
                        var disPatchProd=data;
                        var prodInfo=[];
                        async.each(data,function(p,callback){
                            product.findOne({_id:p._id.products.prodId},{'ProductImages.productmainImage':1},function(err,prod){
                                prodInfo.push(prod);
                                callback();
                            });
                        },function(err){
                            res.send({
                                disPatchProd:disPatchProd,
                                prodInfo:prodInfo
                            });
                        });
                    });
                // ****************************
            }
        })


    });
    // ***********************All Posts End *********************

    // ***********************All Gets Start *********************
    router.get('/getAllOrders', function(req, res) {

        orders.find({

            }).sort({
                addedOnDateTime: -1
            })
            .populate('userRef').exec(function(err, data) {

                res.send({
                    orders: data,
                });
            });

    });

  

   

    // ***********************All Gets End *********************

    // ************All Updates Starts**************
   
    // ************All Updates Ends**************
}