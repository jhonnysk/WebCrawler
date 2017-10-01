var product = require('../models/productSchema').Product;
var tags = require('../models/productSchema').Tags;

var Admin = require('../models/adminSchema').Admin;
var vendor = require('../models/adminSchema').Vendor;
var fs = require('fs');
module.exports = function(router, multipartMiddleware) {

    var productMainImageSection = function(req, productMainImageUrl,currentDir,imgPaths) {
        if (fs.existsSync(currentDir + '/slant/app/' + req.body.products.productPrevImage)) {
            fs.unlinkSync(currentDir + '/slant/app/' + req.body.products.productPrevImage);
        }
        if (fs.existsSync(currentDir + '/client/' + req.body.products.productPrevImage)) {
            fs.unlinkSync(currentDir + '/client/' + req.body.products.productPrevImage);
        }

        var productMainImageData = fs.readFileSync(req.files.mainImage.path);
        var productMainImageName = req.files.mainImage.path.lastIndexOf("\\");
        if (productMainImageName > 0) {
            productMainImageName = req.files.mainImage.path.lastIndexOf("\\");
            productMainImageName = req.files.mainImage.path.substring(productMainImageName + 1);
        } else {
            productMainImageName = req.files.mainImage.path.lastIndexOf("/");
            productMainImageName = req.files.mainImage.path.substring(productMainImageName);
        }

        var imageDir = currentDir + '/slant/app/' + req.body.products.productPrevImage;
        imageDir = imageDir.substring(0, imageDir.lastIndexOf('/'));
        fs.writeFileSync(imageDir + '/' + productMainImageName, productMainImageData);

        imageDir = currentDir + '/client/' + req.body.products.productPrevImage;
        imageDir = imageDir.substring(0, imageDir.lastIndexOf('/'));

        fs.writeFileSync(imageDir + '/' + productMainImageName, productMainImageData);

        productMainImageUrl = productMainImageUrl.substring(0, productMainImageUrl.lastIndexOf('/')) + '/' + productMainImageName;

        if (fs.existsSync(req.files.mainImage.path)) {
            fs.unlinkSync(req.files.mainImage.path);
        }

        return productMainImageUrl;
    }

    var productSubImageSection = function(req,productMainImageUrl,currentDir,imgPaths) {

        var imageDir = currentDir + '/slant/app/' + req.body.products.productPrevImage;
        imageDir = imageDir.substring(0, imageDir.lastIndexOf('/'));
        if (!fs.existsSync(imageDir + '/subImages')) {
            fs.mkdirSync(imageDir + '/subImages');
        }

        var clientImageDir = currentDir + '/client/' + req.body.products.productPrevImage;

        clientImageDir = clientImageDir.substring(0, clientImageDir.lastIndexOf('/'));

        if (!fs.existsSync(clientImageDir + '/subImages')) {
            fs.mkdirSync(clientImageDir + '/subImages');
        }

        imgPaths = [];
        for (var i = 0; i < req.files.subImage.length; i++) {

            var name = req.files.subImage[i].path.lastIndexOf("\\");
            if (name > 0) {
                name = req.files.subImage[i].path.lastIndexOf("\\");
                name = req.files.subImage[i].path.substring(name + 1);
            } else {
                name = req.files.subImage[i].path.lastIndexOf("/");
                name = req.files.subImage[i].path.substring(name);
            }

            var data = fs.readFileSync(req.files.subImage[i].path);
            var newPath = imageDir + '/subImages/' + name;
            fs.writeFileSync(newPath, data);

            newPath = clientImageDir + '/subImages/' + name;
            fs.writeFileSync(newPath, data);

            var dbPath = newPath.lastIndexOf('/uploads');
            dbPath = newPath.substring(dbPath + 1);

            imgPaths.push(dbPath);
            fs.unlinkSync(req.files.subImage[i].path);
        }


        if (req.body.products.productPrevSubImage == undefined || req.body.products.productPrevSubImage == "") {

        } else {
            console.log('holaaaaaaaaaaa');
            console.log(req.body.products.productPrevSubImage);
            if (req.body.products.productPrevSubImage.length > 0) {
                for (var j = 0; j < req.body.products.productPrevSubImage.length; j++) {

                    if (fs.existsSync(currentDir + '/slant/app/' + req.body.products.productPrevSubImage[j])) {
                        fs.unlinkSync(currentDir + '/slant/app/' + req.body.products.productPrevSubImage[j]);
                    }

                    if (fs.existsSync(currentDir + '/client/' + req.body.products.productPrevSubImage[j])) {
                        fs.unlinkSync(currentDir + '/client/' + req.body.products.productPrevSubImage[j]);
                    }
                }
            }
        }
        return imgPaths;
    }

    router.post('/productSave', multipartMiddleware, function(req, res) {

        var date = new Date();
        var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        var imgPaths = [];
        arr = req.files.file;

        var data2 = fs.readFileSync(arr[arr.length - 1].path);
        var mainFile = arr[arr.length - 1].path.lastIndexOf("\\");
        if (mainFile > 0) {
            mainFile = arr[arr.length - 1].path.lastIndexOf("\\");
            mainFile = arr[arr.length - 1].path.substring(mainFile + 1);
        } else {
            mainFile = arr[arr.length - 1].path.lastIndexOf("/");
            mainFile = arr[arr.length - 1].path.substring(mainFile);
        }

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

        newPath = newPath + '/' + yr;
        clientPath = clientPath + '/' + yr;
        if (!fs.existsSync(newPath)) {
            fs.mkdirSync(newPath);
        }
        if (!fs.existsSync(clientPath)) {
            fs.mkdirSync(clientPath);
        }

        newPath = newPath + '/' + mon;
        clientPath = clientPath + '/' + mon;

        if (!fs.existsSync(newPath)) {
            fs.mkdirSync(newPath);
        }

        if (!fs.existsSync(clientPath)) {
            fs.mkdirSync(clientPath);
        }

        var names = fs.readdirSync(newPath);
        var folders = 0;

        for (var i = 0; i < names.length; i++) {

            if (fs.statSync(newPath + '/' + names[i]).isDirectory()) {
                folders++;

            }

        }
        folders = (folders + 1).toString();
        newPath = newPath + '/' + folders;
        clientPath = clientPath + '/' + folders;

        if (!fs.existsSync(newPath)) {
            fs.mkdirSync(newPath);
        }

        if (!fs.existsSync(clientPath)) {
            fs.mkdirSync(clientPath);
        }

        fs.writeFileSync(newPath + '/' + mainFile, data2);
        fs.writeFileSync(clientPath + '/' + mainFile, data2);

        var originalDbPath = newPath.lastIndexOf('/uploads');
        originalDbPath = newPath.substring(originalDbPath + 1);

        var mainImgPath = originalDbPath + '/' + mainFile;

        console.log(mainImgPath);

        fs.unlinkSync(arr[arr.length - 1].path);
        var newPathSubImages = newPath;
        var clientPathSubImages = clientPath;
        for (var i = 0; i < arr.length - 1; i++) {
            var name = arr[i].path.lastIndexOf("\\");
            if (name > 0) {
                name = arr[i].path.lastIndexOf("\\");
                name = arr[i].path.substring(name + 1);
            } else {
                name = arr[i].path.lastIndexOf("/");
                name = arr[i].path.substring(name);
            }
            var data = fs.readFileSync(arr[i].path);
            newPath = newPathSubImages + '/subImages';
            clientPath = clientPathSubImages + '/subImages';
            if (!fs.existsSync(newPath)) {
                fs.mkdirSync(newPath);
            }

            if (!fs.existsSync(clientPath)) {
                fs.mkdirSync(clientPath);
            }
            fs.writeFileSync(newPath + '/' + name, data);

            fs.writeFileSync(clientPath + '/' + name, data);
            var dbPath = originalDbPath + '/subImages/' + name;
            imgPaths.push(dbPath);
            fs.unlinkSync(arr[i].path);
        }


        var productSave = new product();

        productSave.name = req.body.product.name;
        productSave.addedOn = new Date(addedOnDate).toISOString();
        productSave.addedOnDateTime=new Date().toISOString();

        productSave.saleFlag = req.body.product.saleFlag;
        productSave.featuredFlag = req.body.product.featuredFlag;

        productSave.Description.productSku = req.body.product.sku;
        productSave.Description.qty = req.body.product.qty;
        productSave.Description.productColor = req.body.product.colors;
        productSave.Description.productSize = req.body.product.size;

        productSave.ProductImages.productmainImage = mainImgPath;
        productSave.ProductImages.productsubImage = imgPaths;
        productSave.Pricing.regularPrice = req.body.product.price;
        productSave.Pricing.salePrice = req.body.product.salePrice;
        productSave.Pricing.discount = req.body.product.discount;

        productSave.Details.desc = req.body.product.description;
        productSave.Details.spec = req.body.product.spec;
        productSave.Details.manufacturedBy.id = req.body.product.user.userId;
        productSave.Details.manufacturedBy.brand = req.body.product.user.brand;
        productSave.Details.tags = req.body.product.tags;

        productSave.Taxonomy.parent = req.body.product.type;
        productSave.Taxonomy.parentCategory = req.body.product.parentCatagory;
        productSave.Taxonomy.subCategory = req.body.product.subCatagory;

        productSave.save(function(err, data) {
            //console.log(data);
            res.send({
                msg: 'Product Added Successfully'
            });
        });
    });


    router.post('/productEdit/:id', multipartMiddleware, function(req, res) {
        var date = new Date();
        var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());

        var imgPaths = [];
        console.log(req.body.products.productPrevImage);

        var currentDir = __dirname.lastIndexOf('\\');
        if (currentDir > 0) {
            currentDir = __dirname.substring(0, currentDir);
        } else {
            currentDir = __dirname.lastIndexOf('/');
            currentDir = __dirname.substring(0, currentDir);
        }

        console.log(req.files.mainImage);
        console.log(req.files.subImage);

        if (req.body.products.productPrevSubImage != undefined && req.body.products.productPrevSubImage.length > 0) {
            imgPaths = req.body.products.productPrevSubImage;
        }

        var productMainImageUrl = req.body.products.productPrevImage;

        if (req.files.mainImage != undefined && req.files.subImage == undefined) {
            productMainImageUrl=productMainImageSection(req, productMainImageUrl,currentDir,imgPaths);
        }

        if (req.files.mainImage == undefined && req.files.subImage != undefined) {
            imgPaths=productSubImageSection(req,productMainImageUrl,currentDir,imgPaths);
            console.log(imgPaths);
        }
        if (req.files.mainImage != undefined && req.files.subImage != undefined) {
            productMainImageUrl=productMainImageSection(req, productMainImageUrl,currentDir,imgPaths);
            imgPaths=productSubImageSection(req,productMainImageUrl,currentDir,imgPaths);
        }

        product.update({
            _id: req.params.id
        }, {
            $set: {
                name: req.body.products.name,
                lastUpdate: new Date(addedOnDate).toISOString(),

                saleFlag: req.body.products.saleFlag,
                featuredFlag: req.body.products.featuredFlag,

                'ProductImages.productsubImage': imgPaths,
                'ProductImages.productmainImage': productMainImageUrl,

                'Description.productSku': req.body.products.Description.productSku,
                'Description.qty': req.body.products.Description.qty,
                'Description.productColor': req.body.products.colors,
                'Description.productSize': req.body.products.size,
                'Pricing.regularPrice': req.body.products.Pricing.regularPrice,
                'Pricing.salePrice': req.body.products.Pricing.salePrice,
                'Pricing.discount': req.body.products.Pricing.discount,
                'Details.desc': req.body.products.Details.desc,
                'Details.spec': req.body.products.Details.spec,
                'Details.tags': req.body.products.tags
            }
        }, function(err, data) {
            console.log(data);
            res.send({
                msg: "Product Updated Successfully"
            });
        });

    });
}