var product = require('../models/productSchema').Product;
var Admin = require('../models/adminSchema').Admin;
var vendor = require('../models/adminSchema').Vendor;
var orders = require('../models/orderSchema').Order;
var User = require('../models/userSchema').User;
var mongoose = require('mongoose');
var async = require("async");

module.exports = function(router,io) {
    
    // ***********************All Posts Starts *********************
    router.post('/allUsersByDate', function(req, res) {

        var fromDate=new Date(req.body.fromDate);
        var toDate=new Date(req.body.toDate);
        fromDate=fromDate.getFullYear()+'-'+(fromDate.getMonth()+1)+'-'+fromDate.getDate();
        fromDate=new Date(fromDate).toISOString();
        toDate=toDate.getFullYear()+'-'+(toDate.getMonth()+1)+'-'+toDate.getDate();
        toDate=new Date(toDate).toISOString();

        // User.find({
        //     addedOn: {
        //         $gte: new Date(prevDateMsg),
        //         $lte: new Date(currDateMsg)
        //     }
        // }, {
        //     _id: 1,
        //     addedOn: 1,
        //     'personalInfo.firstName': 1
        // }, function(err, data) {
        //     if (err) console.log(err);
        //     //console.log(data);
        //     res.send({
        //         users: data
        //     });
        // });
        User.aggregate([{
                $match: {
                    "addedOn": {
                        // $gte: new Date(prevDateMsg)
                        $gte: new Date(fromDate),
                        $lte: new Date(toDate)
                    }
                }
            }, {
                $sort: {
                    addedOn: -1
                }
            }, {
                $group: {
                    _id: "$addedOn",
                    num: {
                        $sum: 1
                    }
                }
            }],
            function(err, data) {
                //console.log(data);
                res.send(data);
            });
    });


    router.post('/allVendorsByDate', function(req, res) {
        // console.log(req.body);
        var fromDate=new Date(req.body.fromDate);
        var toDate=new Date(req.body.toDate);
        fromDate=fromDate.getFullYear()+'-'+(fromDate.getMonth()+1)+'-'+fromDate.getDate();
        fromDate=new Date(fromDate).toISOString();
        toDate=toDate.getFullYear()+'-'+(toDate.getMonth()+1)+'-'+toDate.getDate();
        toDate=new Date(toDate).toISOString();
       
        // vendor.find({
        //     'accessRight.restricted': false,
        //     'accessRight.activated': true,
        //     activatedOn: {
        //         $gte: new Date(prevDateMsg),
        //         $lte: new Date(currDateMsg)
        //     }
        // }, {
        //     _id: 1,
        //     // activatedOn: 1,
        //     'vendorBussDesc.brandName': 1,
        //     addedOnDateTime: 1
        // }).sort({
        //     addedOnDateTime: -1
        // }).exec(function(err, data) {
        //     res.send(data);
        // })

        vendor.aggregate([{
                    $match: {
                        "activatedOn": {
                            // $gte: new Date(prevDateMsg)
                           $gte: new Date(fromDate),
                            $lte:new Date(toDate)    
                        },
                        'accessRight.restricted': false
                    },
                    //  $match: {
                    //     'accessRight.restricted':false
                    // }
                },


                {
                    $sort: {
                        activatedOn: -1
                    }
                }, {
                    $group: {
                        _id: "$activatedOn",
                        num: {
                            $sum: 1
                        }
                    }
                }
            ],
            function(err, data) {
                // console.log(data);
                res.send(data);
            });
    });

    router.post('/allProductsByDate', function(req, res) {
        var prevDate = new Date();
        prevDate.setDate(prevDate.getDate() - req.body.selectedDate);
        var prevDateMsg = prevDate.getFullYear() + '-' + (prevDate.getMonth() + 1) + '-' + (prevDate.getDate());

        var currDate = new Date();
        var currDateMsg = currDate.getFullYear() + '-' + (currDate.getMonth() + 1) + '-' + (currDate.getDate());

        prevDateMsg = new Date(prevDateMsg).toISOString();
        currDateMsg = new Date(currDateMsg).toISOString();

        if (req.body.user.userId)
            Admin.findOne({
                _id: req.body.user.userId
            }, function(err, data) {
                if (err) console.log(err);
                if (!data) {
                    product.find({
                            addedOn: {
                                $gte: new Date(prevDateMsg),
                                $lte: new Date(currDateMsg)
                            },
                            'Details.manufacturedBy.id': req.body.user.userId
                        }, {
                            _id: 1,
                            name: 1,
                            addedOn: 1,
                            'Details.manufacturedBy': 1,
                            'Taxonomy.parent': 1,
                            addedOnDateTime: 1
                        }).sort({
                            addedOnDateTime: -1
                        })
                        .populate('Taxonomy.parent').exec(function(err, data) {
                            //console.log(data);
                            res.send({
                                products: data
                            });
                        });
                } else {
                    product.find({
                            addedOn: {
                                $gte: new Date(prevDateMsg),
                                $lte: new Date(currDateMsg)
                            }
                        }, {
                            _id: 1,
                            name: 1,
                            addedOn: 1,
                            addedOnDateTime: 1,
                            'Details.manufacturedBy': 1,
                            'Taxonomy.parent': 1
                        }).sort({
                            addedOnDateTime: -1
                        })
                        .populate('Taxonomy.parent').exec(function(err, data) {
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
                                addedOnDateTime: -1
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
                                _id: "$addedOn",
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
                                addedOnDateTime: -1
                            }
                        }, {
                            $unwind: "$productList"
                        },

                        {
                            $group: {
                                _id: "$addedOn",
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

    router.post('/productGraph', function(req, res) {
        //console.log(req.body.user.userId);
      
        var fromDate=new Date(req.body.fromDate);
        var toDate=new Date(req.body.toDate);
        fromDate=fromDate.getFullYear()+'-'+(fromDate.getMonth()+1)+'-'+fromDate.getDate();
        fromDate=new Date(fromDate).toISOString();
        toDate=toDate.getFullYear()+'-'+(toDate.getMonth()+1)+'-'+toDate.getDate();
        toDate=new Date(toDate).toISOString();
       
        Admin.findOne({
            _id: req.body.user.userId
        }, function(err, admin) {

            if (!admin) {
                product.aggregate([{
                            $match: {
                                "addedOn": {
                                    // $gte: new Date(prevDateMsg)
                                   $gte: new Date(fromDate),
                                    $lte:new Date(toDate) 
                                },
                                "Details.manufacturedBy.id": mongoose.Types.ObjectId(req.body.user.userId)
                            },
                            
                        },

                        {
                            $sort: {
                                addedOn: -1
                            }
                        },

                        {
                            $group: {
                                _id: "$addedOn",
                                num: {
                                    $sum: 1
                                }
                            }
                        }
                    ],
                    function(err, data) {
                        //console.log(data);
                        res.send(data);
                    });
            } else {
                product.aggregate([{
                        $match: {
                            "addedOn": {
                                //$gte: new Date(prevDateMsg)
                                $gte: new Date(fromDate),
                                $lte:new Date(toDate)    
                          
                            }
                        }
                    }, {
                        $sort: {
                            addedOn: -1
                        }
                    }, {
                        $group: {
                            _id: "$addedOn",
                            num: {
                                $sum: 1
                            }
                        }
                    }],
                    function(err, data) {
                        //console.log(data);
                        res.send(data);
                    });
            }
        })


    });

    router.post('/productGraphMonthly', function(req, res) {
        //console.log(req.body.user.userId);
        Admin.findOne({
            _id: req.body.user.userId
        }, function(err, admin) {

            if (!admin) {
                product.aggregate([{
                            $match: {
                                "Details.manufacturedBy.id": mongoose.Types.ObjectId(req.body.user.userId)
                            }
                        }, {
                            $sort: {
                                addedOnDateTime: -1
                            }
                        },

                        {
                            $group: {
                                _id: {
                                    $month: "$addedOnDateTime"
                                },
                                num: {
                                    $sum: 1
                                }
                            }
                        }

                    ],
                    function(err, data) {
                        // console.log('holaaaaaaaaa');
                        //  console.log(data);
                        res.send(data);
                    });

            } else {
                product.aggregate([

                        {
                            $sort: {
                                addedOnDateTime: -1
                            }
                        },

                        {
                            $group: {
                                _id: {
                                    $month: "$addedOnDateTime"
                                },
                                num: {
                                    $sum: 1
                                }
                            }
                        }

                    ],
                    function(err, data) {
                        // console.log('holaaaaaaaaa');
                        //  console.log(data);
                        res.send(data);
                    });
            }
        });

    });

    router.post('/userGraphMonthly', function(req, res) {
        //console.log(req.body.user.userId);

        User.aggregate([{
                    $sort: {
                        addedOn: -1
                    }
                },

                {
                    $group: {
                        _id: {
                            $month: "$addedOn"
                        },
                        num: {
                            $sum: 1
                        }
                    }
                }

            ],
            function(err, data) {
                res.send(data);
            });

    });

    router.post('/vendorGraphMonthly', function(req, res) {
        //console.log(req.body.user.userId);
        vendor.aggregate([{
                    $match: {

                        'accessRight.restricted': false,
                        'accessRight.activated': true
                    },
                   
                },


                {
                    $sort: {
                        activatedOn: -1
                    }
                }, {
                    $group: {
                        _id: {
                            $month: "$activatedOn"
                        },
                        num: {
                            $sum: 1
                        }
                    }
                }
            ],
            function(err, data) {
                // console.log(data);
                res.send(data);
            });

    });

    router.post('/orderGraphMonth/', function(req, res) {
        console.log(req.body.user.userId);
        Admin.findOne({
            _id: req.body.user.userId
        }, function(err, a) {
            if (!a) {
                orders.aggregate([{
                            $sort: {
                                addedOnDateTime: -1
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
                                _id: {
                                    $month: "$addedOnDateTime",
                                },
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
            } 
            else {
               orders.aggregate([
                   {
                    $sort:{
                        addedOnDateTime:-1
                    }
                   },
                   {
                       $unwind:'$productList' 
                   }, 
                   {
                     $group:
                         {
                            _id:{
                                $month:"$addedOnDateTime"
                            },
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
               ],function(err,data){
                    res.send(data);
               });
            }
        })
    });

    router.post('/get_New_Order', function(req, res) {
       
        // var d = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + (new Date().getDate());

        Admin.findOne({
            _id: req.body.userId
        }, function(err, a) {
            if (!a) {
                orders.find({
                    // addedOn: new Date(d).toISOString(),
                    status: 'pending',
                    'productList.vendorInfo.id': req.body.userId
                }, {
                    addedOnDateTime: 1,
                    orderId: 1,
                    userRef: 1
                }).sort({
                    addedOnDateTime: -1
                }).populate('userRef').exec(function(err, data) {
                    res.send({
                        orders: data
                    });
                });
            } else {
                orders.find({
                    // addedOn: new Date(d).toISOString(),
                    status: 'pending'
                }, {
                    addedOnDateTime: 1,
                    orderId: 1,
                    userRef: 1
                }).sort({
                    addedOnDateTime: -1
                }).populate('userRef').exec(function(err, data) {
                    res.send({
                        orders: data
                    });
                });
            }
        });
    });
    
    router.post('/getAllOrders', function(req, res) {
             var fromDate=new Date(req.body.fromDate);
        var toDate=new Date(req.body.toDate);
        fromDate=fromDate.getFullYear()+'-'+(fromDate.getMonth()+1)+'-'+fromDate.getDate();
        fromDate=new Date(fromDate).toISOString();
        toDate=toDate.getFullYear()+'-'+(toDate.getMonth()+1)+'-'+toDate.getDate();
        toDate=new Date(toDate).toISOString();
        orders.find({
            addedOn:{$lte:new Date(toDate),$gte:new Date(fromDate)}
            }).sort({
                addedOnDateTime: -1
            })
            .populate('userRef').exec(function(err, data) {

                res.send({
                    orders: data,
                });
            });

    });
     router.post('/getOwnOrders', function(req, res) {

        var fromDate=new Date(req.body.fromDate);
        var toDate=new Date(req.body.toDate);
        fromDate=fromDate.getFullYear()+'-'+(fromDate.getMonth()+1)+'-'+fromDate.getDate();
        fromDate=new Date(fromDate).toISOString();
        toDate=toDate.getFullYear()+'-'+(toDate.getMonth()+1)+'-'+toDate.getDate();
        toDate=new Date(toDate).toISOString();
        orders.find({
                'productList.vendorInfo.id': req.body.userId,
                addedOn:{$lte:new Date(toDate),$gte:new Date(fromDate)}

            }).sort({
                addedOnDateTime: -1
            })
            .populate('userRef').exec(function(err, data) {
               
                res.send({
                    orders: data,
                });
            });
    });

router.post('/getOwnPendingOrders', function(req, res) {

        orders.find({'productList.vendorInfo.id': req.body.userId,'status':'pending'}).sort({
                addedOnDateTime: -1
            })
            .populate('userRef').exec(function(err, data) {

                res.send({
                    orders: data,
                });
            });

    });

      router.post('/getReturnOrdersVendor', function(req, res) {
        //console.log(req.body.userId);
        var returnOrders;
        var returnOrderDetals=[];
        orders.aggregate([
                    {
                         $match: {
                                'productList.vendorInfo.id':req.body.userId
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

                                "productList.vendorInfo.id": req.body.userId,
                                'productList.returnObj.status1':'return'
                            }
                        },
                         {
                            $group: {
                                _id: {id:"$_id",orderId:"$orderId",addedOnDateTime:"$addedOnDateTime",status:"$status"}
                            }
                        }
                    ],
                    function(err, data) {
                        returnOrders=data;
                        // res.send({
                        //     orders:data
                        // });
                        ////////////////////////////////
                        async.each(data, function(eachOrder, callback) {
                            orders.findOne({_id: eachOrder._id.id}).populate('userRef').exec(function(err, o) {
                                returnOrderDetals.push(o);
                                callback();
                            })}, function(err) {
                                    res.send({
                                        orders: returnOrders,
                                        details: returnOrderDetals
                                    });
                                });
                        /////////////////////////////////
                    });

    });
    // ***********************All Posts End *********************

    // ***********************All Gets Start *********************


    router.get('/getReturnOrders', function(req, res) {

        orders.find({'productList.returnObj.status1':'return'

            }).sort({
                addedOnDateTime: -1
            })
            .populate('userRef').exec(function(err, data) {

                res.send({
                    orders: data,
                });
            });

    });

    router.get('/getPendingOrders', function(req, res) {
         // console.log('assdadaads');
       orders.find({
                status: 'pending'
            }).sort({'addedOnDateTime': -1})
            .populate('userRef').exec(function(err, data) {
               
                res.send({
                    orders: data,
                });
            });
    });

    router.get('/orderDetails/:orderId', function(req, res) {
        orders.findOne({
                _id: req.params.orderId
            })
            .populate({
                path: 'userRef'
            }).exec(function(err, data) {
                if(data){
                    var orderDetails = data;
                    var prodInfo = [];
                    var a = [];
                    async.each(data.productList, function(eachProduct, callback) {
                        product.findOne({
                            _id: eachProduct.prodId
                        },{'ProductImages.productmainImage':1}, function(err, p) {
                            prodInfo.push(p);
                            callback();
                        });

                    }, function(err) {
                        res.send({
                            orders: orderDetails,
                            prodInfo: prodInfo
                        });
                    });
                }
                else{
                       res.send('none');
                }
            });

    });



    router.get('/getReminderOrders/:vendorId', function(req, res) {
        var reminderOrderObj={};
        var reminderOrders=[];
        orders.find({'productList.vendorInfo.id':req.params.vendorId,'productList.reminder':true},function(err,o){
            for(var i=0;i<o.length;i++){
                for(var j=0;j<o[i].productList.length;j++){
                    if(o[i].productList[j].vendorInfo.id==req.params.vendorId && o[i].productList[j].reminder==true){
                        reminderOrderObj.orderMongoId=o[i]._id;
                        reminderOrderObj.orderId=o[i].orderId;
                        reminderOrderObj.addedOnDateTime=o[i].addedOnDateTime;
                        reminderOrders.push(reminderOrderObj);
                        break;
                    }
                }
            }
            res.send(reminderOrders);
        })

    });

    // ***********************All Gets End *********************

    // ************All Updates Starts**************
    router.post('/makeDelivery/:orderId', function(req, res) {
        var date = new Date();
        var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        orders.update({
            _id: req.params.orderId
        }, {
            $set: {
                status: 'delivered',
                deliveryDate:new Date(addedOnDate).toISOString(),
                deliveryDateTime:new Date().toISOString()
            }
        }, function(err, data) {
            if (data.nModified > 0) {
                res.send({
                    msg: "Order Delivered"
                });
                io.sockets.emit('welcome');
            } else {
                res.send({
                    msg: "Already Delivered"
                });
            }

        });
    });
    router.post('/makeDispatch/:orderId', function(req, res) {
         var date = new Date();
        var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        orders.findOne({
            _id: req.params.orderId
        }, function(err, o) {
            var updateOrderList = [];
            if (o) {
                for (var i = 0; i < o.productList.length; i++) {
                    for (var j = 0; j < req.body.products.length; j++) {
                        if (o.productList[i].prodTrack_id == req.body.products[j].prodTrack_id) {
                            o.productList[i].dispatch = true;
                            o.productList[i].dispatchDate=new Date(addedOnDate).toISOString();
                            o.productList[i].dispatchDateTime=new Date().toISOString();
                            o.productList[i].reminder=false;
                        }
                    }
                }
                updateOrderList = o.productList;
                orders.update({
                    _id: req.params.orderId
                }, {
                    $set: {
                        "productList": updateOrderList
                    }
                }, function(err, data) {
                    res.send({
                        msg: 'Product Dispatch Successfully'
                    });
                });
            }
        });
    });

    router.post('/orderRemainder/:orderId', function(req, res) {
        orders.findOne({
            _id: req.params.orderId
        }, function(err, o) {
            var updateOrderList = [];
            if (o) {
                for (var i = 0; i < o.productList.length; i++) {
                    if(o.productList[i].prodTrack_id==req.body.prodTrack_id){
                        o.productList[i].reminder=true;
                        break;
                    }
                }
                updateOrderList = o.productList;
                orders.update({
                    _id: req.params.orderId
                }, {
                    $set: {
                        "productList": updateOrderList
                    }
                }, function(err, data) {
                    res.send({
                        msg: 'Remind Sent'
                    });
                });
            }
        });
    });
    // ************All Updates Ends**************
}