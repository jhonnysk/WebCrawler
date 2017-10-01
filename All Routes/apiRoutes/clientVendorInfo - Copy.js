var Admin = require('../models/adminSchema').Admin;
var vendor = require('../models/adminSchema').Vendor;
var parentCategory = require('../models/categorySchema').ParentCategory;
var type = require('../models/categorySchema').Type;
var product = require('../models/productSchema').Product;

module.exports = function(router) {
    router.get('/singleVendor/:vendorSlug', function(req, res) {
        vendor.findOne({
            'vendorBussDesc.vendorSlug': req.params.vendorSlug
        }, function(err, data) {
            // console.log(data._id);
            if (data) {
                vendor.findOne({
                    _id: data._id
                }, function(err, vendor) {
                    // console.log(vendor);
                    res.send({
                        vendor: vendor
                    });
                });
            }
        });
    });

    router.get('/featureBrandProducts/:vendorSlug', function(req, res) {
        var vendorId;
        vendor.findOne({
            'vendorBussDesc.vendorSlug': req.params.vendorSlug
        }, function(err, vendorf) {
            if (vendorf) {
                vendorId = vendorf._id;
                product.find({
                    'Details.manufacturedBy.id': vendorId,
                }).sort({
                    addedOnDateTime: -1
                }).limit(10).populate('Taxonomy.parent').exec(function(err, products) {
                    res.send({
                        products: products
                    });
                });
            }
        });
    });


    router.get('/vendorNewProducts/:vendorSlug', function(req, res) {
        var vendorId;
        vendor.findOne({
            'vendorBussDesc.vendorSlug': req.params.vendorSlug
        }, function(err, vendorf) {
            if (vendorf) {
                vendorId = vendorf._id;
                product.find({
                    'Details.manufacturedBy.id': vendorId,
                }).sort({
                    addedOnDateTime: -1
                }).limit(3).exec(function(err, products) {
                    res.send({
                        products: products
                    });
                });
            }
        });
        // product.find().sort({
        //            addedOnDateTime: -1
        //        }).exec(function(err, products) {
        //            res.send({
        //                products: products
        //            });
        //        });
    });

    router.get('/vendorMostViewed/:vendorSlug', function(req, res) {
        var vendorId;
        vendor.findOne({
            'vendorBussDesc.vendorSlug': req.params.vendorSlug
        }, function(err, vendorf) {
            if (vendorf) {
                vendorId = vendorf._id;
                product.find({
                    'Details.manufacturedBy.id': vendorId,
                }).sort({
                    mostViewed: -1
                }).limit(3).exec(function(err, products) {
                    res.send({
                        products: products
                    });
                });
            }
        });
    });

    router.get('/vendorTopSale/:vendorSlug', function(req, res) {
        var vendorId;
        vendor.findOne({
            'vendorBussDesc.vendorSlug': req.params.vendorSlug
        }, function(err, vendorf) {
            if (vendorf) {
                vendorId = vendorf._id;
                product.find({
                    'Details.manufacturedBy.id': vendorId,
                }).sort({
                    totalSale: -1
                }).limit(3).exec(function(err, products) {
                    res.send({
                        products: products
                    });
                });
            }
        });
    });

     router.get('/getVendorProducts/:vendorSlug/:parentCat', function(req, res) {
        var vendorId;
        console.log(req.params.vendorSlug);
        console.log(req.params.parentCat);
        vendor.findOne({
            'vendorBussDesc.vendorSlug': req.params.vendorSlug
        }, function(err, ven) {

            if (ven) {
                vendorId = ven._id;
                var coverPhoto=ven.vendorImage.profilePic;
                if (req.params.parentCat == 'Men') {
                    getParentProducts('Men',vendorId,coverPhoto,res);
                }
                if (req.params.parentCat == 'Women') {
                   getParentProducts('Women',vendorId,coverPhoto,res);
                }
                if (req.params.parentCat == 'Kids') {
                   getParentProducts('Kids',vendorId,coverPhoto,res);
                }
                if (req.params.parentCat == 'Home&Decor') {
                   getParentProducts('HomeAndDecor',vendorId,coverPhoto,res);
                }



                if (req.params.parentCat == 'New') {
                    product.find({
                        'Details.manufacturedBy.id': vendorId
                    }).sort({
                        addedOnDateTime: -1
                    }).populate('Taxonomy.parent').exec(function(err, products) {
                        res.send({
                            products: products,
                            coverPhoto:coverPhoto
                        });
                    });
                }

                if (req.params.parentCat == 'Sale') {
                    product.find({
                        'Details.manufacturedBy.id': vendorId,
                        saleFlag: 1
                    }).sort({
                        addedOnDateTime: -1
                    }).populate('Taxonomy.parent').exec(function(err, products) {
                        res.send({
                            products: products,
                            coverPhoto:coverPhoto
                        });
                    });
                }

                if(req.params.parentCat == 'Viewed'){
                    product.find({
                        'Details.manufacturedBy.id': vendorId,
                    }).sort({
                        mostViewed: -1
                    }).populate('Taxonomy.parent').exec(function(err, products){
                        res.send({
                            products: products,
                            coverPhoto:coverPhoto
                        });
                    });
                }

                
                if(req.params.parentCat == 'Top_Sale'){
                    product.find({
                        'Details.manufacturedBy.id': vendorId,
                    }).sort({
                        totalSale: -1
                    }).populate('Taxonomy.parent').exec(function(err, products){
                        res.send({
                            products: products,
                            coverPhoto:coverPhoto
                        });
                    });
                }

                else{
                    type.findOne({typeSlug:req.params.parentCat},function(err,t){
                        if(t){
                            var tId=t._id;
                            product.find({
                            'Details.manufacturedBy.id': vendorId,'Taxonomy.parent':tId
                            }).sort({addedOnDateTime:-1}).populate('Taxonomy.parent').exec(function(err,products){
                                 res.send({
                            products: products,
                            coverPhoto:coverPhoto
                        });
                            });                            
                        }
                    })
                    
                      
                }
            }
        });

    });

function getParentProducts(pName,vendorId,coverPhoto,res){
            parentCategory.findOne({
                        name: pName
                    }, function(err, pCat) {
                        if (pCat) {
                            product.find({
                                'Details.manufacturedBy.id': vendorId,
                                'Taxonomy.parentCategory': pCat._id
                            }).sort({
                                addedOnDateTime: -1
                            }).populate('Taxonomy.parent').exec(function(err, products) {
                                res.send({
                                    products: products,
                                    coverPhoto:coverPhoto
                                });
                            });
                        }
                    })
}

   
    
    function showProducts(queryObj,skip1,limit1,res){
        // console.log(skip1);
         product.find(queryObj).sort({addedOnDateTime:-1}).populate({
            path: 'Taxonomy.parent'
        }).skip(skip1).limit(limit1).exec(function(err, data) {
                     //console.log(data);   
                    res.send(data);
                });
    }
 router.post('/searchVendorProducts/:vendorId/:catId', function(req, res) {
       
                req.body.queryObj["Details.manufacturedBy.id"]=req.params.vendorId;
                 console.log(req.body.queryObj);
                parentCategory.findOne({_id:req.params.catId},function(err,pCat){
                    if(pCat){
                        // console.log(pCat);
                       if(req.body.parentStep==1){
                            req.body.queryObj["Taxonomy.parentCategory"]=pCat._id;
                        }
                         showProducts(req.body.queryObj,req.body.skip,req.body.limit,res);
                  }
                    
                    else{
                       // console.log('asdasdasd');
                        if(req.body.parentStep==1){
                            req.body.queryObj["Taxonomy.parent"]=req.params.catId;
                        }
                        showProducts(req.body.queryObj,req.body.skip,req.body.limit,res);
                    }

                });
               
        });
    
    function dynamicSizes(a,res){
         product.distinct("singleQty.size",a, function(err, data) {
            res.send(data);
        });
    }

    function dynamicColors(a,res){
         product.distinct("singleQty.color",a, function(err, data) {
            res.send(data);
        });
    }

     function dynamicTags(a,res){
         product.distinct("Details.tags",a, function(err, data) {
            res.send(data);
        });
    }

    router.post('/getProductSizes/:vendorId/:catId/:parentStep', function(req, res) {
       
        var a=req.body;

        a["Details.manufacturedBy.id"]=req.params.vendorId;
        parentCategory.findOne({_id:req.params.catId},function(err,pCat){
            if(pCat){
                if(req.params.parentStep==1){
                 a["Taxonomy.parentCategory"]=pCat._id;   
                }
                dynamicSizes(a,res);
            }
            else{
                if(req.params.parentStep==1){
                    a["Taxonomy.parent"]=req.params.catId;    
                }
                
                dynamicSizes(a,res);
            }
        });
               
        });


      router.post('/getProductColors/:vendorId/:catId/:parentStep', function(req, res) {
       
        var a=req.body;

        a["Details.manufacturedBy.id"]=req.params.vendorId;
        parentCategory.findOne({_id:req.params.catId},function(err,pCat){
            if(pCat){
                if(req.params.parentStep==1){
                 a["Taxonomy.parentCategory"]=pCat._id;   
                }
                dynamicColors(a,res);
            }
            else{
                if(req.params.parentStep==1){
                    a["Taxonomy.parent"]=req.params.catId;    
                }
                
                dynamicColors(a,res);
            }
        });
               
        });


      router.post('/getProductTgs/:vendorId/:catId/:parentStep', function(req, res) {
       
        var a=req.body;

        a["Details.manufacturedBy.id"]=req.params.vendorId;
        parentCategory.findOne({_id:req.params.catId},function(err,pCat){
            if(pCat){
                if(req.params.parentStep==1){
                 a["Taxonomy.parentCategory"]=pCat._id;   
                }
                dynamicTags(a,res);
            }
            else{
                if(req.params.parentStep==1){
                    a["Taxonomy.parent"]=req.params.catId;    
                }
                
                dynamicTags(a,res);
            }
        });
               
        });


}