var product = require('../models/productSchema').Product;
var Admin = require('../models/adminSchema').Admin;
var vendor = require('../models/adminSchema').Vendor;
var orders = require('../models/orderSchema').Order;
var User = require('../models/userSchema').User;
var mongoose = require('mongoose');
var async = require("async");

module.exports = function(router) {

    // ***********************All Gets Starts *********************
    router.get('/withdrawNone/:vendorId', function(req, res) {
        orders.aggregate([{
                    $match: {
                        "productList.vendorInfo.id": req.params.vendorId,
                        "status": "delivered"
                    }
                }, {
                    $sort: {
                        addedOnDateTime: 1
                    }
                }, {
                    $unwind: "$productList"
                }, {
                    $match: {
                        "productList.vendorInfo.id": req.params.vendorId,
                        "productList.withdrawStatus": "none"
                    }
                }, {
                    $group: {
                        _id: {
                            id: "$_id",
                            orderId: "$orderId",
                            addedOnDateTime: "$addedOnDateTime",
                            commissionPercent:'$productList.commissionObj.percent'
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
    });


    // ***********************All Gets End *********************

    // ***********************All Posts Starts *********************
    router.post('/withDrawReq/:vendorId', function(req, res) {
        var date = new Date();
        date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        async.each(req.body, function(eachOrder, callback) {
            orders.findOne({
                _id: eachOrder._id.id
            }, function(err, o) {
                for (var i = 0; i < o.productList.length; i++) {
                    if (o.productList[i].vendorInfo.id == req.params.vendorId) {
                        o.productList[i].withdrawStatus = "pending";

                        o.productList[i].withdrawReqDate = new Date(date).toISOString();
                        o.productList[i].withdrawReqDateTime = new Date().toISOString();
                    }
                }
                var pendingList = o.productList;
                orders.update({
                    _id: eachOrder._id.id
                }, {
                    $set: {
                        productList: pendingList
                    }
                }, function(err, update) {
                    //if(qtyUpdate.nModified==1){
                    callback();
                    //}
                });
            });

        }, function(err) {
            res.send({
                msg: 'Sent'
            });
        });
    });

    router.post('/approveWithdraw/:vendorId', function(req, res) {
        var date = new Date();
        date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        async.each(req.body, function(eachOrder, callback) {
            orders.findOne({
                _id: eachOrder._id.id
            }, function(err, o) {
                for (var i = 0; i < o.productList.length; i++) {
                    if (o.productList[i].vendorInfo.id == req.params.vendorId) {
                        o.productList[i].withdrawStatus = "approved";

                        o.productList[i].approvedDate = new Date(date).toISOString();
                        o.productList[i].approvedDateTime = new Date().toISOString();
                    }
                }
                var approveList = o.productList;
                orders.update({
                    _id: eachOrder._id.id
                }, {
                    $set: {
                        productList: approveList
                    }
                }, function(err, update) {
                    //if(qtyUpdate.nModified==1){
                    callback();
                    //}
                });
            });

        }, function(err) {
            res.send({
                msg: 'Sent'
            });
        });
    });

    router.post('/pendingWithdraw/:vendorId', function(req, res) {
        orders.aggregate([{
                    $match: {
                        "productList.vendorInfo.id": req.params.vendorId,
                        "status": "delivered",
                        "productList.withdrawStatus": "pending"
                    }
                },

                {
                    $sort: {
                        'productList.withdrawReqDateTime': 1
                    }
                }, {
                    $unwind: "$productList"
                }, {
                    $match: {
                        "productList.vendorInfo.id": req.params.vendorId,
                        "productList.withdrawStatus": "pending"
                    }
                }, {
                    $group: {
                        _id: {
                            id: "$_id",
                            orderId: "$orderId",
                            withdrawReqDateTime: "$productList.withdrawReqDateTime",
                            commissionPercent:'$productList.commissionObj.percent'
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
    });

    router.post('/showApprovedWithdraw/:vendorId', function(req, res) {
        orders.aggregate([{
                    $match: {
                        "productList.vendorInfo.id": req.params.vendorId,
                        "status": "delivered",
                        "productList.withdrawStatus": "approved"
                    }
                },

                {
                    $sort: {
                        "productList.approvedDateTime": 1
                    }
                }, {
                    $unwind: "$productList"
                }, {
                    $match: {
                        "productList.vendorInfo.id": req.params.vendorId,
                        "productList.withdrawStatus": "approved"
                    }
                }, {
                    $group: {
                        _id: {
                            id: "$_id",
                            orderId: "$orderId",
                            approvedDateTime: "$productList.approvedDateTime",
                            commissionPercent:'$productList.commissionObj.percent'
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
    });
    router.post('/pendingWithdrawVendor/:vendorId', function(req, res) {
        orders.aggregate([{
                    $match: {
                        "status": "delivered",
                        "productList.withdrawStatus": "pending"
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
                        "productList.withdrawStatus": "pending"
                    }
                },

                {
                    $group: {
                        _id: {
                            vendorName: "$productList.vendorInfo.brand",
                            vendorId: "$productList.vendorInfo.id"
                        }
                    }
                }

            ],
            function(err, data) {
                res.send(data);
            });
    });

    router.post('/approvedWithdrawVendor/:userId', function(req, res) {
        orders.aggregate([{
                    $match: {
                        "status": "delivered",
                        "productList.withdrawStatus": "approved"
                    }
                },

                {
                    $sort: {
                        "productList.approvedDateTime": 1
                    }
                }, {
                    $unwind: "$productList"
                }, {
                    $match: {
                        "productList.withdrawStatus": "approved"
                    }
                },

                {
                    $group: {
                        _id: {
                            vendorName: "$productList.vendorInfo.brand",
                            vendorId: "$productList.vendorInfo.id"
                        }
                    }
                }

            ],
            function(err, data) {
                res.send(data);
            });
    });

}