var product = require('../models/productSchema').Product;
var tags = require('../models/productSchema').Tags;

var Admin = require('../models/adminSchema').Admin;
var vendor = require('../models/adminSchema').Vendor;
var fs = require('fs');
var async = require('async');
module.exports = function(router, multipartMiddleware) {
 

    router.post('/productSave', multipartMiddleware, function(req, res) {

        var date = new Date();
        var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        var imgPaths = [];
        var imgPathsOriginal=[];

        var yr = date.getFullYear().toString();
        var mon = (date.getMonth() + 1).toString();

        var currentDir = __dirname.lastIndexOf('\\');
        if (currentDir > 0) {
            currentDir = __dirname.substring(0, currentDir);
        } else {
            currentDir = __dirname.lastIndexOf('/');
            currentDir = __dirname.substring(0, currentDir);
        }


        var newPath = currentDir + '/slant/app/uploads/products';
        var clientPath = currentDir + '/client/uploads/products';
        if (!fs.existsSync(newPath)) {
            fs.mkdirSync(newPath);
        }

        if (!fs.existsSync(clientPath)) {
            fs.mkdirSync(clientPath);
        }

       
        var croppedImages=[];
        var mainImages=[];
        for(var i=0;i<req.body.productCroppedImages.length-1;i++){
         
            var date2=new Date();
            var base64Data = req.body.productCroppedImages[i].replace(/^data:image\/png;base64,/, "");
            fs.writeFileSync(newPath + '/' + date2.getTime()+'.jpg',base64Data,'base64');
            fs.writeFileSync(clientPath + '/'+date2.getTime()+'.jpg',base64Data,'base64');
            croppedImages.push('uploads/products/'+date2.getTime()+'.jpg');

            var dateOrg=new Date();
            base64Data = req.body.productMainImages[i].replace(/^data:image\/\w+;base64,/, "");
            fs.writeFileSync(newPath + '/' + dateOrg.getTime()+'.jpg',base64Data,'base64');
            fs.writeFileSync(clientPath + '/'+dateOrg.getTime()+'.jpg',base64Data,'base64');
            mainImages.push('uploads/products/'+dateOrg.getTime()+'.jpg');
        }

            var date2=new Date();
            base64Data = req.body.productCroppedImages[req.body.productCroppedImages.length-1].replace(/^data:image\/png;base64,/, "");
            fs.writeFileSync(newPath + '/' + date2.getTime()+'.jpg',base64Data,'base64');
            fs.writeFileSync(clientPath + '/'+date2.getTime()+'.jpg',base64Data,'base64');
            var croppedImageMain='uploads/products/'+date2.getTime()+'.jpg';

            var dateOrg=new Date();
            base64Data = req.body.productMainImages[req.body.productMainImages.length-1].replace(/^data:image\/\w+;base64,/, "");
            fs.writeFileSync(newPath + '/' + dateOrg.getTime()+'.jpg',base64Data,'base64');
            fs.writeFileSync(clientPath + '/'+dateOrg.getTime()+'.jpg',base64Data,'base64');
            var imageMain='uploads/products/'+dateOrg.getTime()+'.jpg';

        var productSave = new product();

        productSave.name = req.body.name;
        productSave.addedOn = new Date(addedOnDate).toISOString();
        productSave.addedOnDateTime=new Date().toISOString();

        productSave.saleFlag = req.body.saleFlag;
        productSave.featuredFlag = req.body.featuredFlag;
        productSave.singleQty=req.body.singleQtyArr;
        // productSave.Description.qty = req.body.qty;
       
        // productSave.Description.productSize = req.body.size;
        // if(req.body.colors!=undefined){
        //          for(var i=0;i<req.body.colors.length;i++){
        //     productSave.Description.productColor.push(req.body.colors[i].text.toLowerCase());
        //     }
        // }

        // if(req.body.size!=undefined){ 
        //     for(var i=0;i<req.body.size.length;i++){
        //         productSave.Description.productSize.push(req.body.size[i].text.toLowerCase());
        //     }   
        // }

        if(req.body.tags!=undefined){
            for(var i=0;i<req.body.tags.length;i++){
            productSave.Details.tags.push(req.body.tags[i].text.toLowerCase());
        }
        }

        productSave.ProductImages.productmainImage = croppedImageMain;
        productSave.ProductImages.productsubImage = croppedImages;
        productSave.ProductImages.productmainImageOriginal = imageMain;
        productSave.ProductImages.productsubImageOriginal = mainImages;

        productSave.Pricing.regularPrice = req.body.price;
        productSave.Pricing.salePrice = req.body.salePrice;
        productSave.Pricing.discount = req.body.discount;

        productSave.Details.desc = req.body.description;
        productSave.Details.spec = req.body.spec;
        productSave.Details.manufacturedBy.id = req.body.user.userId;
        productSave.Details.manufacturedBy.brand = req.body.user.brand;
        // productSave.Details.tags = req.body.tags;

        productSave.Taxonomy.parent = req.body.type._id;
        productSave.Taxonomy.parentCategory = req.body.parentCatagory._id;
        productSave.Taxonomy.subCategory = req.body.subCatagory._id;

        productSave.save(function(err, data) {
            res.send({
                msg: 'Product Added Successfully'
            });
            // console.log(data._id.toString());

             var sku=data._id.toString();
             sku=sku.slice(sku.length-12);
            product.update({_id:data._id},{$set:{'Description.productSku':sku.toUpperCase()}},function(err,p){
            });

            // product.find(function(err,p){
            //     async.each(p,function(eachProd,callback){
            //         var obj={};
            //         obj.size="xl";
            //         obj.color="black";
            //         obj.qty=5;
            //         obj.prodTrackId=new Date().getTime();
            //         var q=[];
            //         q.push(obj);
            //         var sku=eachProd._id.toString();
            //         sku=sku.slice(sku.length-12);
            //         product.update({_id:eachProd._id},{$set:{'Description.productSku':sku.toUpperCase(),singleQty:q}},function(err,d){
            //         console.log(d);
            //         callback();
            //     });
            //     },function(err){console.log(err)});
            // });
        });
    });


    router.post('/productEdit/:id', multipartMiddleware, function(req, res) {
        // product.update({},{
        //             $set: {
        //                 'trashBox.recycled': 0,
        //                 'Description.qty':5
        //             }
        //         },{multi:true},function(err,data){
        //             console.log(data);
        // });
        // product.update({'Details.manufacturedBy.id':'5691427b80a71c7830026208'},{
        //             $set: {
        //                 'Details.manufacturedBy.id': '56c33d863c6f01ac36286b4a',
        //                 'Details.manufacturedBy.brand':'O2'
        //             }
        //         },{multi:true},function(err,data){
        //             console.log(data);
        // });
        var date = new Date();
        var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());

        var subImagePaths=[];
        var subImageOriginal=[];
        var mainImage;
        var mainImageOriginal;

        var currentDir = __dirname.lastIndexOf('\\');
        if (currentDir > 0) {
            currentDir = __dirname.substring(0, currentDir);
        } else {
            currentDir = __dirname.lastIndexOf('/');
            currentDir = __dirname.substring(0, currentDir);
        }

        var newPath = currentDir + '/slant/app/uploads/products';
        var clientPath = currentDir + '/client/uploads/products';
        for(var i=0;i<req.body.ProductImages.productsubImage.length;i++){
            if(req.body.productPrevSubImage[i]==req.body.ProductImages.productsubImage[i]){
                subImagePaths.push(req.body.ProductImages.productsubImage[i]);
            }
            else{
                if(fs.existsSync(currentDir+"/slant/app/"+req.body.productPrevSubImage[i])){
                    fs.unlinkSync(currentDir+"/slant/app/"+req.body.productPrevSubImage[i]);
                }
                if(fs.existsSync(currentDir+"/client/"+req.body.productPrevSubImage[i])){
                    fs.unlinkSync(currentDir+"/client/"+req.body.productPrevSubImage[i]);
                }
                if(req.body.ProductImages.productsubImage[i]=="#" || req.body.ProductImages.productsubImage[i]==undefined ||req.body.ProductImages.productsubImage[i]==null){

                }
                else{
                    var date2=new Date();
                    var base64Data = req.body.ProductImages.productsubImage[i].replace(/^data:image\/png;base64,/, "");
                    fs.writeFileSync(newPath + '/' + date2.getTime()+'.jpg',base64Data,'base64');
                    fs.writeFileSync(clientPath + '/'+date2.getTime()+'.jpg',base64Data,'base64');
                    subImagePaths.push('uploads/products/'+date2.getTime()+'.jpg');
                }
                
            }

            
        }

        for(var i=0;i<req.body.ProductImages.productsubImageOriginal.length;i++){
            if(req.body.product_Prev_SubImages_Original[i]==req.body.ProductImages.productsubImageOriginal[i]){
                subImageOriginal.push(req.body.ProductImages.productsubImageOriginal[i]);
            }
            else{
                if(fs.existsSync(currentDir+"/slant/app/"+req.body.product_Prev_SubImages_Original[i])){
                    fs.unlinkSync(currentDir+"/slant/app/"+req.body.product_Prev_SubImages_Original[i]);
                }
                if(fs.existsSync(currentDir+"/client/"+req.body.product_Prev_SubImages_Original[i])){
                    fs.unlinkSync(currentDir+"/client/"+req.body.product_Prev_SubImages_Original[i]);
                }
                if(req.body.ProductImages.productsubImageOriginal[i]=="#" ||req.body.ProductImages.productsubImageOriginal[i]==undefined || req.body.ProductImages.productsubImageOriginal[i]==null){

                }
                else{
                    var date2=new Date();
                    var base64Data = req.body.ProductImages.productsubImageOriginal[i].replace(/^data:image\/\w+;base64,/, "");
                    fs.writeFileSync(newPath + '/' + date2.getTime()+'.jpg',base64Data,'base64');
                    fs.writeFileSync(clientPath + '/'+date2.getTime()+'.jpg',base64Data,'base64');
                    subImageOriginal.push('uploads/products/'+date2.getTime()+'.jpg');
                }
                
            }

        }
            if(req.body.productPrevImage==req.body.ProductImages.productmainImage){
                mainImage=req.body.ProductImages.productmainImage;
            }
            else{
                if(fs.existsSync(currentDir+"/slant/app/"+req.body.productPrevImage)){
                    fs.unlinkSync(currentDir+"/slant/app/"+req.body.productPrevImage);
                }
                if(fs.existsSync(currentDir+"/client/"+req.body.productPrevImage)){
                    fs.unlinkSync(currentDir+"/client/"+req.body.productPrevImage);
                }
                if(req.body.ProductImages.productmainImage=="#" || req.body.ProductImages.productmainImage==undefined ||req.body.ProductImages.productmainImage==null){

                }
                else{
                var date2=new Date();
                var base64Data = req.body.ProductImages.productmainImage.replace(/^data:image\/png;base64,/, "");
                fs.writeFileSync(newPath + '/' + date2.getTime()+'.jpg',base64Data,'base64');
                fs.writeFileSync(clientPath + '/'+date2.getTime()+'.jpg',base64Data,'base64');
                mainImage='uploads/products/'+date2.getTime()+'.jpg';
                }
                
            }

            if(req.body.product_Prev_MainImage_Original==req.body.ProductImages.productmainImageOriginal){
                mainImageOriginal=req.body.ProductImages.productmainImageOriginal;
            }
            else{
                if(fs.existsSync(currentDir+"/slant/app/"+req.body.product_Prev_MainImage_Original)){
                    fs.unlinkSync(currentDir+"/slant/app/"+req.body.product_Prev_MainImage_Original);
                }
                if(fs.existsSync(currentDir+"/client/"+req.body.product_Prev_MainImage_Original)){
                    fs.unlinkSync(currentDir+"/client/"+req.body.product_Prev_MainImage_Original);
                }

                if(req.body.ProductImages.productmainImageOriginal=="#" ||  req.body.ProductImages.productmainImageOriginal==undefined ||req.body.ProductImages.productmainImageOriginal==null){

                }
                else{
                    var date2=new Date();
                var base64Data = req.body.ProductImages.productmainImageOriginal.replace(/^data:image\/\w+;base64,/, "");
                fs.writeFileSync(newPath + '/' + date2.getTime()+'.jpg',base64Data,'base64');
                fs.writeFileSync(clientPath + '/'+date2.getTime()+'.jpg',base64Data,'base64');
                mainImageOriginal='uploads/products/'+date2.getTime()+'.jpg';
                }
                
            }
        
        // var prodSize=[];
        // var prodColor=[];
        var prodTags=[];
        // for(var i=0;i<req.body.size.length;i++){
        //     prodSize.push(req.body.size[i].text.toLowerCase());
        // }
        // for(var i=0;i<req.body.colors.length;i++){
        //     prodColor.push(req.body.colors[i].text.toLowerCase());
        // }
        for(var i=0;i<req.body.tags.length;i++){
            prodTags.push(req.body.tags[i].text.toLowerCase());
        }
        product.update({
            _id: req.params.id
        }, {
            $set: {
                name: req.body.name,
                lastUpdate: new Date(addedOnDate).toISOString(),

                saleFlag: req.body.saleFlag,
                featuredFlag: req.body.featuredFlag,

                'ProductImages.productsubImage': subImagePaths,
                'ProductImages.productmainImage': mainImage,
                'ProductImages.productmainImageOriginal': mainImageOriginal,
                'ProductImages.productsubImageOriginal': subImageOriginal,

                'Description.productSku': req.body.Description.productSku,
                // 'Description.qty': req.body.Description.qty,
                'singleQty':req.body.singleQty,
                // 'Description.productColor': prodColor,
                // 'Description.productSize': prodSize,
                'Pricing.regularPrice': req.body.Pricing.regularPrice,
                'Pricing.salePrice': req.body.Pricing.salePrice,
                'Pricing.discount': req.body.Pricing.discount,
                'Details.desc': req.body.Details.desc,
                'Details.spec': req.body.Details.spec,
                'Details.tags': prodTags
            }
        }, function(err, data) {
            console.log(data);
            res.send({
                msg: "Product Updated Successfully"
            });
        });

    });
    
    router.post('/searchBySku',function(req,res){
            Admin.findOne({
            _id: req.body.userId
        }, function(err, user) {
            if (err) console.log(err);
            if (user) {
                product.find({"Description.productSku":req.body.sku}, {
                    "ProductImages.productsubImage": 0,
                    "ProductImages.productmainImageOriginal": 0,
                    "ProductImages.productsubImageOriginal": 0
                }).exec(function(err, data) {

                    res.send({
                        products: data
                    });
                  
                });

            } else {

                product.find({"Details.manufacturedBy.id":req.body.userId,"Description.productSku":req.body.sku}).exec(function(err, data) {
                    res.send({
                        products: data
                    });
                });
            }

        });
        });
    // **************All Gets Starts***************
        router.get('/distinctSizes',function(req,res){
                product.distinct( "Description.productSize",function(err,data){
                 res.send(data);
            });
    });

        router.get('/distinctColors',function(req,res){
            product.distinct( "Description.productColor",function(err,data){
                 res.send(data);
            });
        });

        router.get('/distinctTags',function(req,res){
            product.distinct( "Details.tags",function(err,data){
                 res.send(data);
            });
        });


        router.get('/recycleProduct/:prodId/:recycleFlag',function(req,res){
            product.update({_id:req.params.prodId},{$set:{'trashBox.recycled':req.params.recycleFlag}},function(err,data){
                // console.log(data);
                res.send({
                    data:data,
                    msg:'Product Send To Recycle bin'
                })
            })
        });
        
        
    // **************All Gets Ends*****************
}