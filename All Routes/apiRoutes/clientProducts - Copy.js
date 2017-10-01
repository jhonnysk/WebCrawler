var product = require('../models/productSchema').Product;
var parentCategory = require('../models/categorySchema').ParentCategory;
var subCategory = require('../models/categorySchema').SubCategory;
var type = require('../models/categorySchema').Type;

module.exports = function(router) {
    router.get('/featuredProducts', function(req, res) {
        product.find({
            featuredFlag: 1
        }).populate('Taxonomy.parent').exec(function(err, data) {
            res.send({
                featuredProduct: data
            });
        });
    });

    router.get('/saleProducts', function(req, res) {
        product.find({
            saleFlag: 1
        }).populate('Taxonomy.parent').exec(function(err, data) {
            res.send({
                saleProduct: data
            });
        });
    });

    router.get('/allPro', function(req, res) {
        product.find().populate('Taxonomy.parentCategory').exec(function(err, data) {
            res.send({
                allPro: data
            });
        });
    });

    router.get('/getRelatedProduct/:slug', function(req, res) {
        console.log('asdasdasda');
        console.log(req.params.slug);
        type.findOne({typeSlug:req.params.slug},function(err,t){
            if(t){
                product.find({'Taxonomy.parent':t._id}).sort({addedOnDateTime:-1}).populate('Taxonomy.parent').limit(15).exec(function(err,p){
                    res.send(p);
                });
            }
            else{
                res.send("No products");
            }
        });
    });

    router.get('/getProductQty/:prodId', function(req, res) {

        product.findOne({_id:req.params.prodId},{singleQty:1},function(err,p){
            res.send(p);
        });
    });
    
    // *********  Post section Start

    function showProducts(queryObj,skip1,limit1,res){
         product.find(queryObj).sort({addedOnDateTime:-1}).populate({
            path: 'Taxonomy.parent'
        }).skip(skip1).limit(limit1).exec(function(err, data) {
                    res.send({
                        products: data
                    });
                });
    }
    router.post('/getProducts/:slug', function(req, res) {
         var paretName=false;
         var typeId;
        if(req.params.slug=="newArrivals"){
           showProducts(req.body.queryObj,req.body.skip,req.body.limit,res);
        }
            if (req.params.slug == 'Men') {
                paretName=true;
                getParentProducts('Men',res);
            }
            if (req.params.slug == 'Women') {
                paretName=true;    
               getParentProducts('Women',res);
            }
            if (req.params.slug == 'Kids') {
                paretName=true;
               getParentProducts('Kids',res);
            }
            if (req.params.slug == 'Home&Decor') {
                paretName=true;
               getParentProducts('HomeAndDecor',res);
            } 
             if (req.params.slug == 'HomeAndDecor') {
                paretName=true;
                 getParentProducts('HomeAndDecor',res);
            } 

            else{
             type.findOne({typeSlug:req.params.slug},function(err,t){
                if(t){
                    if(req.body.parentStep==1){
                        req.body.queryObj["Taxonomy.parent"]=t._id; 
                    }
                    
                    showProducts(req.body.queryObj,req.body.skip,req.body.limit,res);
                         
                }
             })   
            }
     
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
    router.post('/getProductSizes/:slug/:parentSep', function(req, res) {
         console.log(req.params.slug);
        var a=req.body;
        if(req.params.slug=="newArrivals"){
           dynamicSizes(a,res)
        }
         else{
             type.findOne({typeSlug:req.params.slug},function(err,t){
                if(t){
                    if(req.params.parentSep==1){
                       a["Taxonomy.parent"]= t._id;
                    }
                    dynamicSizes(a,res);
     
                }
             })   
            }
    });

    router.post('/getProductColors/:slug/:parentSep', function(req, res) {
            // console.log(req.params.slug);
        var a=req.body;
        if(req.params.slug=="newArrivals"){
           dynamicColors(a,res)
        }
         else{
             type.findOne({typeSlug:req.params.slug},function(err,t){
                if(t){
                    if(req.params.parentSep==1){
                       // req.body.queryObj["Taxonomy.parent"]=t._id;
                       a["Taxonomy.parent"]= t._id;
                    }
                    dynamicColors(a,res);
     
                }
             })   
            }
    });

    router.post('/getProductTags/:slug/:parentSep', function(req, res) {
          var a=req.body;
        if(req.params.slug=="newArrivals"){
           dynamicTags(a,res)
        }
         else{
             type.findOne({typeSlug:req.params.slug},function(err,t){
                if(t){
                    if(req.params.parentSep==1){
                       // req.body.queryObj["Taxonomy.parent"]=t._id;
                       a["Taxonomy.parent"]= t._id;
                    }
                    dynamicTags(a,res);
     
                }
             })   
            }
    });


}


