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

    router.get('/topSale', function(req, res){
        product.find().limit(10).sort({totalSale:-1}).exec(function(err, data){
            res.send(data)
        })
    })

    router.get('/mostViewedProducts', function(req, res) {
        product.find().limit(10).sort({mostViewed:-1}).populate('Taxonomy.parent').exec(function(err, data) {
            res.send({
                mostViewed: data
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
        // console.log('asdasdasda');
        // console.log(req.params.slug);
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
    router.post('/getProducts/:slug/:all', function(req, res) {
         var paretName=false;
         var typeId;
        //if(req.params.all=="all"){
                if(req.params.slug=="newArrivals"){
                    showProducts(req.body.queryObj,req.body.skip,req.body.limit,res);   
                }
                else{
                     type.findOne({typeSlug:req.params.slug},function(err,t){
                        if(t){
                            req.body.queryObj["Taxonomy.parent"]=t._id;             
                        }
                        showProducts(req.body.queryObj,req.body.skip,req.body.limit,res);
                     })   
            }
       // }
        // else{
        //          type.findOne({typeSlug:req.params.slug},function(err,t){
        //                 if(t){
        //                     req.body.queryObj["Taxonomy.parent"]=t._id;
        //                    showProducts(req.body.queryObj,req.body.skip,req.body.limit,res);             
        //                 }
        //                 else{
        //                  showProducts(req.body.queryObj,req.body.skip,req.body.limit,res);                
        //                 }
        //              })   
        //     }
           
     
    });

    function dynamicSizes(a,res){
        // console.log('dynamicSizes');
        //  console.log(a);
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

    function switchCases(flag,a,res){
        switch(flag){
            case 'sizes':dynamicSizes(a,res);
            break;

            case 'colors':dynamicColors(a,res);
            break;

            case 'tags':dynamicTags(a,res);
            break;
        }
    }
    function color_size_tags(all,slug,a,res,flag){
        // if(all=="all"){
            if(slug=="newArrivals"){
                switchCases(flag,a,res);
            }
            else{
             type.findOne({typeSlug:slug},function(err,t){
                if(t){
                       a["Taxonomy.parent"]= t._id;                 
                }
                        switchCases(flag,a,res);
             })   
            }
        // }

        // else{
        //     type.findOne({typeSlug:slug},function(err,t){
        //         if(t){
        //                a["Taxonomy.parent"]= t._id;
        //                  switchCases(flag,a,res);
        //         }
        //         else{
        //                  switchCases(flag,a,res);             
        //         }
        //      })   
        //     }         
    }
    router.post('/getProductSizes/:slug/:all', function(req, res) {
        delete req.body['singleQty.size'];
        var a=req.body;
         color_size_tags(req.params.all,req.params.slug,a,res,'sizes');

    });

    router.post('/getProductColors/:slug/:all', function(req, res) {
        delete req.body['singleQty.color']; 
        var a=req.body;
        color_size_tags(req.params.all,req.params.slug,a,res,'colors');
    });

    router.post('/getProductTags/:slug/:all', function(req, res) {
         delete req.body['Details.tags'];
          var a=req.body;
       color_size_tags(req.params.all,req.params.slug,a,res,'tags');    
    });
}