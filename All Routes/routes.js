var fs = require('fs');
var sendgrid = require("sendgrid")("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");
var parentCategory = require('./models/categorySchema').ParentCategory;
var subCategory = require('./models/categorySchema').SubCategory;
var type = require('./models/categorySchema').Type;

var product = require('./models/productSchema').Product;
var tags = require('./models/productSchema').Tags;

var Admin = require('./models/adminSchema').Admin;
var vendor = require('./models/adminSchema').Vendor;
var branch = require('./models/adminSchema').VendorBranch;
var forgot = require('./models/adminSchema').ForgotSchema;
var siteControl = require('./models/siteControlSchema').SiteControl;
var User = require('./models/userSchema').User; // ######## sai #######
var Review = require('./models/productSchema').Review; // ######## sai #######
var arr = [];

var async = require('async');

// var date = new Date();
// var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());

module.exports = function(express, app, multipartMiddleware, passport) {
    //   app.use(express.static(__dirname + "/slant/app"));
    app.use(express.static(__dirname + "/client/"));
    app.use("/backoffice", express.static(__dirname + "/slant/app/"));
    //////////////All Gets/////////////
    app.get('/api/parentcategory', function(req, res) {
        parentCategory.find().sort({pos:1}).exec(function(err, data) {
            res.send({
                parent: data
            });

        });
    });

    app.get('/api/subcategory/:id', function(req, res) {

        subCategory.find({parent: req.params.id}).sort({pos:1}).exec(function(err, data) {

            res.send({
                subCategory: data
            });
        })
    });

    app.get('/api/type/:id', function(req, res) {
        type.find({
            parent: req.params.id
        }, function(err, data) {

            res.send({
                type: data
            });
        })
    });

    app.get('/api/types/:mainCatId', function(req, res) {

        type.find({}).populate({
            path: 'parent',
            match: {
                parent: req.params.mainCatId
            }
        }).exec(function(err, data) {

            var typeArr = [];
            for (var i = 0; i < data.length; i++) {
                if (data[i].parent != null) {
                    //console.log(data[i]);
                    typeArr.push(data[i]);
                }
            }
            res.send({
                types: typeArr
            });
        });
    });

    app.get('/api/tags', function(req, res) {
        tags.find(function(err, data) {

            res.send({
                tags: data
            });
        })
    });

    // app.get('/api/getProducts/:id', function(req, res) {
    //     product.find({
    //         'Taxonomy.parent': req.params.id
    //     }, function(err, data) {

    //         res.send({
    //             products: data
    //         });
    //     })
    // });

    app.post('/api/getProducts/:id/:userId', function(req, res) {

        Admin.findOne({
            _id: req.params.userId
        }, function(err, user) {
            if (err) console.log(err);
            if (user) {
                product.find({
                    'Taxonomy.parent': req.params.id
                }).sort({
                    addedOnDateTime: -1
                }).skip(req.body.skip).limit(req.body.limit).exec(function(err, data) {
                    res.send({
                        products: data
                    });
                })
            } else {
                product.find({
                    'Taxonomy.parent': req.params.id,
                    'Details.manufacturedBy.id': req.params.userId
                }).sort({
                    addedOnDateTime: -1
                }).skip(req.body.skip).limit(req.body.limit).exec(function(err, data) {
                    res.send({
                        products: data
                    });
                })
            }

        });
        // product.find({
        //     'Taxonomy.parent': req.params.id
        // }, function(err, data) {

        //     res.send({
        //         products: data
        //     });
        // })
    });

    app.post('/api/getProductsForShow/:userId', function(req, res) {
        // console.log(req.body.step);
        Admin.findOne({
            _id: req.params.userId
        }, function(err, user) {
            if (err) console.log(err);
            if (user) {
                if (req.body.step == 1) {

                    delete req.body.queryObj['Details.manufacturedBy.id'];
                }
                // req.body.queryObj['trashBox.recycled']=0;
                product.find(req.body.queryObj, {
                    "ProductImages.productsubImage": 0,
                    "ProductImages.productmainImageOriginal": 0,
                    "ProductImages.productsubImageOriginal": 0
                }).sort({
                    addedOnDateTime: -1
                }).skip(req.body.skip).limit(req.body.limit).exec(function(err, data) {

                    // else{
                    res.send({
                        products: data
                    });
                    //}

                });

            } else {

                // req.body.queryObj['trashBox.recycled']=0;
                product.find(req.body.queryObj,{
                    "ProductImages.productsubImage": 0,
                    "ProductImages.productmainImageOriginal": 0,
                    "ProductImages.productsubImageOriginal": 0
                }).sort({
                    addedOnDateTime: -1
                }).skip(req.body.skip).limit(req.body.limit).exec(function(err, data) {
                    res.send({
                        products: data
                    });
                });
            }

        });
        //  }
        // else{
        //     res.send();
        // }


    });

    function getParentProducts(pName, res) {
        parentCategory.findOne({
            name: pName
        }, function(err, pCat) {
            if (pCat) {
                product.find({

                    'Taxonomy.parentCategory': pCat._id
                }).sort({
                    addedOnDateTime: -1
                }).populate('Taxonomy.parent').exec(function(err, products) {
                    res.send(products);
                });
            }
        })
    }
   

    app.get('/api/productEdit/:id', function(req, res) {
        var populateQuery = [{
            path: 'Taxonomy.parent'
        }, {
            path: 'Taxonomy.parentCategory'
        }, {
            path: 'Taxonomy.subCategory'
        }];
        product.findOne({
            _id: req.params.id
        }).populate(populateQuery).exec(function(err, data) {

            res.send({
                prodInfo: data
            });
        })
    });

    app.get('/api/getVendor', function(req, res) {

        vendor.find({
            'accessRight.restricted': false,
            'accessRight.activated': true
        }, {
            _id: 1,
            username: 1,
            // activatedOn: 1,
            addedOnDateTime: 1,
            'personalInfo.firstName': 1,
            'personalInfo.lastName': 1,
            'personalInfo.personalMobile': 1,
            'vendorBussDesc.brandName': 1
        }).sort({
            addedOnDateTime: -1
        }).exec(function(err, data) {
            res.send({
                vendors: data
            });
        })
    });

    app.get('/api/getNewVendor', function(req, res) {

        vendor.find({
            'accessRight.activated': false
        }, {
            _id: 1,
            username: 1,
            // addedOn: 1,
            addedOnDateTime: 1,
            'personalInfo.firstName': 1,
            'personalInfo.lastName': 1,
            'personalInfo.personalMobile': 1,
            'vendorBussDesc.brandName': 1,
            'vendorImage.logo': 1
        }).sort({
            addedOnDateTime: -1
        }).exec(function(err, data) {
            res.send({
                vendors: data
            });
        })
    });

    app.get('/api/getRestrictedVendor', function(req, res) {

        vendor.find({
            'accessRight.restricted': true
        }, {
            _id: 1,
            username: 1,
            restrictedOn: 1,
            'personalInfo.firstName': 1,
            'personalInfo.lastName': 1,
            'personalInfo.personalMobile': 1,
            'vendorBussDesc.brandName': 1
        }, function(err, data) {
            res.send({
                vendors: data
            });
        });
    });
    app.get('/api/singleVendor/:id', function(req, res) {

        vendor.findOne({
            _id: req.params.id
        }, function(err, data) {

            res.send({
                vendor: data
            });
        });
    });

    app.get('/api/getAdmins', function(req, res) {

        Admin.find({}, {
            _id: 1,
            username: 1,
            email: 1,
            addedOn: 1
        }, function(err, data) {

            res.send({
                admins: data
            });
        });
    });

    app.get('/api/singleAdmin/:id', function(req, res) {

        Admin.findOne({
            _id: req.params.id
        }, function(err, data) {
            siteControl.find(function(err, site) {
                res.send({
                    admin: data,
                    site: site
                });

            })
        });
    });

    app.get('/api/getValidity/:id', function(req, res) {
        // Admin.findOne({_id:req.params.id},function(err,data){
        //if(err) console.log(err);
        // if(!data){
        vendor.findOne({
            _id: req.params.id
        }, function(err, data) {
            if (err) console.log(err);
            if (data) {
                res.send(data.accessRight.restricted);
            } else {
                res.send('ok');
            }
        });
        //  }
        //});
    });

    app.get('/api/getProfileInfo/:id', function(req, res) {
        Admin.findOne({
            _id: req.params.id
        }, function(err, user) {
            if (err) console.log(err);
            if (user) {
                res.send({
                    access: true,
                    userId: user._id,
                    brand: 'Admin',
                    activated: true,
                    restricted: false,
                    imgUrl: user.profilePic
                });
            } else {
                vendor.findOne({
                    _id: req.params.id
                }, function(err, user) {
                    if (err) console.log(err);
                    else {
                        res.send({
                            access: false,
                            userId: user._id,
                            brand: user.vendorBussDesc.brandName,
                            activated: user.accessRight.activated,
                            restricted: user.accessRight.restricted,
                            imgUrl: user.vendorImage.logo
                        });
                    }
                });
            }

        });
    });

    app.post('/api/allUsers', function(req, res) {
        //console.log(req.body);
        var fromDate = new Date(req.body.fromDate);
        var toDate = new Date(req.body.toDate);
        fromDate = fromDate.getFullYear() + '-' + (fromDate.getMonth() + 1) + '-' + fromDate.getDate();
        fromDate = new Date(fromDate).toISOString();
        toDate = toDate.getFullYear() + '-' + (toDate.getMonth() + 1) + '-' + toDate.getDate();
        toDate = new Date(toDate).toISOString();


        User.find({
                addedOn: {
                    $gte: new Date(fromDate),
                    $lte: new Date(toDate)
                }
            }, {
                'personalInfo.firstName': 1,
                'personalInfo.lastName': 1,
                'personalInfo.personalMobile': 1,
                username: 1,
                addedOn: 1
            },
            function(err, data) {
                res.send({
                    users: data
                });
            })
    });

    app.get('/api/allRestrictedUsers', function(req, res) {
        User.find({
            'accessRight.restricted': true
        }, {
            'personalInfo.firstName': 1,
            'personalInfo.lastName': 1,
            'personalInfo.personalMobile': 1,
            username: 1,
            addedOn: 1
        }, function(err, data) {
            res.send({
                users: data
            });
        })
    });




    //////////////All Gets Ends/////////////

    //////////////All Posts Method/////////////
    app.post('/api/subcategorySave', function(req, res) {

        var date = new Date();
        var time = date.getTime();
        var subCat = new subCategory();
        subCat.name = req.body.name;
        subCat.typeSlug = req.body.typeSlug;
        subCat.parent = req.body.parentId;
        subCat.pos=time.toString().substring(6);
        subCat.save(function(err, data) {
            // console.log(data);
            res.send(data);
        });
    });

    app.post('/api/typeSave', function(req, res) {
        var types = new type();
        types.name = req.body.typeName
        types.parent = req.body.subCatagory._id;
        types.typeSlug = req.body.typeSlug;
        types.others.gender = req.body.gender;
        // types.parent=req.body.parentId;
        types.save(function(err, data) {

            res.send(data);
        });
    });



    app.post('/api/tagsSave', function(req, res) {
        var tag = new tags();
        tag.name = req.body.name

        tag.save(function(err, data) {
            res.send(data);
        });
    });

    app.post('/api/tagsEdit/:id', function(req, res) {
        tags.update({
            _id: req.params.id
        }, {
            $set: {
                name: req.body.name
            }
        }, function(err, data) {
            if (err) console.log(err);
            res.send(data);
        });

    });



    app.post('/api/sendMail', function(req, res) {

        var email = new sendgrid.Email();
        email.addTo(req.body.toEmail);
        email.setFrom(req.body.fromEmail);
        email.setSubject(req.body.sub);
        email.setHtml(req.body.body1);
        sendgrid.send(email, function(err, json) {
            if (err) {
                console.log(err);
            }
            console.log(json);
            res.send({
                msg: 'Email send Successfully'
            });
        });
    })

    app.post('/api/resetPassword/:id', function(req, res) {
        console.log(req.body);
        var a = new Admin();
        Admin.update({
            _id: req.params.id
        }, {
            $set: {
                password: a.generateHash(req.body.password),
                pg: req.body.password
            }
        }, function(err, data) {
            if (err) console.log(err);
            // console.log(data);
            if (data.n == 0) {
                var v = new vendor();
                vendor.update({
                    _id: req.params.id
                }, {
                    $set: {
                        password: v.generateHash(req.body.password),
                        pg: req.body.password
                    }
                }, function(err, data) {
                    if (err) console.log(err);
                    console.log(data);
                    res.send({
                        msg: 'Password Reset'
                    });
                })
            } else {
                res.send({
                    msg: 'Password Reset'
                });
            }
        })
    });


    app.post('/api/forgotPasswordLink', function(req, res) {
         console.log(req.body);
        var f = new forgot();
        f.email = req.body.email;
        f.password = req.body.password;
        f.save(function(err, data) {
            if (err) console.log(err);
            // console.log(data);
            var email = new sendgrid.Email();
            email.addTo(req.body.email);
            email.setFrom('imranulhasan73@gmail.com');
            email.setSubject('Forgot Password Link');
            email.setHtml("<p>Your Security Key is:" + data._id + "<p><br><a href=http://localhost:3000/backoffice/conf.html>Click To activate</a>");
            sendgrid.send(email, function(err, json) {
                if (err) {
                    console.log(err);
                }
                console.log(json);
                res.send({
                    msg: 'Reset Link is Send to u .  It will expire soon'
                });
            });
        });
    });

    // app.get('/resetForgotPassword',function(req,res){

    //     res.send('<a href="http://localhost:3000/admin/conf.html">Click</a>')
    // });

    app.post('/api/successReset', function(req, res) {
        var globalEmail = "";
        var globalPassword = "";
        console.log(req.body);
        forgot.findOne({
            _id: req.body.sKey
        }, function(err, data) {
            if (err) console.log(err);
            if (data) {
                globalEmail = data.email;
                globalPassword = data.password;
                var a = new Admin();
                Admin.update({
                    'email': globalEmail
                }, {
                    $set: {
                        password: a.generateHash(globalPassword),
                        pg: globalPassword
                    }
                }, function(err, data) {
                    console.log(data);
                    if (err) console.log(err);
                    
                    if (data.n < 1) {
                        var v = new vendor();
                        vendor.update({
                            'username': globalEmail
                        }, {
                            $set: {
                                password: v.generateHash(globalPassword),
                                pg: globalPassword
                            }
                        }, function(err, data) {
                            if (err) console.log(err);
                            if (data.n < 1) {
                                res.send({
                                    msg: 'No User'
                                });
                            } else {
                                res.send({
                                    msg: 'successReset Oke'
                                });
                                forgot.remove({
                                    email: globalEmail
                                }, function(err, data) {
                                    if (err) console.log(err);
                                });

                            }

                        })
                    }
                     else {
                        res.send({
                            msg: 'successReset Oke'
                        });
                        forgot.remove({
                            email: globalEmail
                        }, function(err, data) {
                            if (err) console.log(err);
                        });
                    }
                })
            } else {
                res.send({
                    msg: 'No User'
                });
            }
        });


    });



    app.post('/api/saveSiteLogo', function(req, res) {
        // console.log(req.body.prevLogoSrc.siteLogo);
        var date = new Date();
        var newPath = __dirname + '/slant/app/uploads/siteImg';
        var clientPath = __dirname + '/client/uploads/siteImg';
        if (!fs.existsSync(newPath)) {
            fs.mkdirSync(newPath);
        }
        if (!fs.existsSync(clientPath)) {
            fs.mkdirSync(clientPath);
        }
        var base64Data = req.body.siteLogoSrc.replace(/^data:image\/\w+;base64,/, "");
        fs.writeFileSync(newPath + '/' + date.getTime() + '.jpg', base64Data, 'base64');
        fs.writeFileSync(clientPath + '/' + date.getTime() + '.jpg', base64Data, 'base64');

        if (req.body.prevLogoSrc == undefined || req.body.prevLogoSrc == null || req.body.prevLogoSrc == "") {
            var site = new siteControl();
            site.siteLogo = 'uploads/siteImg/' + date.getTime() + '.jpg';
            site.save(function(err, data) {
                res.send({
                    msg: 'Logo Saved'
                });
            })
        } else {
            if (fs.existsSync(__dirname + '/slant/app/' + req.body.prevLogoSrc.siteLogo)) {
                fs.unlinkSync(__dirname + '/slant/app/' + req.body.prevLogoSrc.siteLogo)
            }
            if (fs.existsSync(__dirname + '/client/' + req.body.prevLogoSrc.siteLogo)) {
                fs.unlinkSync(__dirname + '/client/' + req.body.prevLogoSrc.siteLogo)
            }
            siteControl.update({
                _id: req.body.prevLogoSrc._id
            }, {
                $set: {
                    siteLogo: 'uploads/siteImg/' + date.getTime() + '.jpg'
                }
            }, function(err, site) {
                res.send({
                    msg: 'Logo Updated'
                });
            })
        }
    });


    app.post('/api/getProductSizes', function(req, res) {
        // console.log(req.body);
        var a = req.body;
        product.distinct("singleQty.size", a, function(err, data) {
            res.send(data);
        });
    });

    app.post('/api/getProductColors', function(req, res) {
        // console.log(req.body);
        var a = req.body;
        product.distinct("singleQty.color", a, function(err, data) {
            res.send(data);
        });
    });

    app.post('/api/getProductTags', function(req, res) {
        // console.log(req.body);
        var a = req.body;
        product.distinct("Details.tags", a, function(err, data) {
            res.send(data);
        });
    });

    //////////////All Posts Method End/////////////

    ///////////Updates Goes Here////////

    app.post('/api/parentCategoryEdit/:id', function(req, res) {
         var date = new Date();
        var time = date.getTime();
        parentCategory.update({
            _id: req.params.id
        }, {
            $set: {
                name: req.body.name,
                typeSlug: req.body.typeSlug,
                 pos:time.toString().substring(6)
            }
        }, function(err, data) {

            res.send(data);
        });
    });
    app.post('/api/subCategoryEdit/:id', function(req, res) {
         var date = new Date();
        var time = date.getTime();
        subCategory.update({
            _id: req.params.id
        }, {
            $set: {
                name: req.body.name,
                typeSlug:req.body.typeSlug,
                pos:time.toString().substring(6)
            }
        }, function(err, data) {

            res.send(data);
        });
    });

    app.post('/api/typeEdit/:id', function(req, res) {
        type.update({
            _id: req.params.id
        }, {
            $set: {
                name: req.body.name,
                typeSlug: req.body.typeSlug,
                "others.gender": req.body.gender
            }
        }, function(err, data) {

            res.send(data);
        });
    });



    app.post('/api/vendorActivate/:id', function(req, res) {
        var date = new Date();
        var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());

        vendor.update({
            _id: req.params.id
        }, {
            $set: {
                'accessRight.activated': req.body.activated,
                activatedOn: new Date(addedOnDate).toISOString(),
                addedOnDateTime: new Date().toISOString(),
                'commission.status':'approved',
                'commission.prevCommission':0,
                'commission.tempCommission':0,
                'commission.newCommission':0,
                'commission.commissionApprovedDate':new Date(addedOnDate).toISOString(),
                'commission.commissionApprovedTime':new Date().toISOString()

            }
        }, function(err, data) {
            if (err) console.log(err);
            res.send(data);
        });
    });

    app.post('/api/vendorRestrict/:id', function(req, res) {
        var date = new Date();
        var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        vendor.update({
            _id: req.params.id
        }, {
            $set: {
                'accessRight.restricted': req.body.restricted,
                restrictedOn: new Date(addedOnDate).toISOString()
            }
        }, function(err, data) {
            if (err) console.log(err);
            res.send(data);
        });
    });

    app.post('/api/userRestrict/:id', function(req, res) {
        // console.log(req.params.id);
        User.update({
            _id: req.params.id
        }, {
            $set: {
                'accessRight.restricted': req.body.restricted
            }
        }, function(err, data) {
            if (err) console.log(err);
            res.send(data);
        });
    });

    app.post('/api/editAdmin/:id', multipartMiddleware, function(req, res) {

        var profilePicUrl = req.body.admin.prevProfilepic;
        if (req.files.profilePic != undefined) {

            if (req.body.admin.prevProfilepic != "") {
                if (fs.existsSync(__dirname + '/slant/app/' + req.body.admin.prevProfilepic)) {
                    fs.unlinkSync(__dirname + '/slant/app/' + req.body.admin.prevProfilepic);
                }
            }
            var profilePicData = fs.readFileSync(req.files.profilePic.path);
            var profilePicName = req.files.profilePic.path.lastIndexOf("\\");
            console.log(profilePicName);

            if (profilePicName > 0) {
                profilePicName = req.files.profilePic.path.lastIndexOf("\\");
                profilePicName = req.files.profilePic.path.substring(profilePicName + 1);

            } else {
                profilePicName = req.files.profilePic.path.lastIndexOf("/");
                profilePicName = req.files.profilePic.path.substring(profilePicName);
            }

            var adminDir = __dirname + '/slant/app/uploads/admins';
            if (!fs.existsSync(adminDir)) {
                fs.mkdirSync(adminDir);
            }
            fs.writeFileSync(adminDir + '/' + profilePicName, profilePicData);


            profilePicUrl = 'uploads/admins/' + profilePicName;
            fs.unlinkSync(req.files.profilePic.path);
        }

        var date = new Date();
        var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        Admin.update({
            _id: req.params.id
        }, {
            $set: {
                username: req.body.admin.username,
                email: req.body.admin.email,
                lastUpdate: new Date(addedOnDate).toISOString(),
                profilePic: profilePicUrl
            }
        }, function(err, data) {
            res.send({
                msg: 'Updated'
            });
        });
    });
    ///////////Updates Ends Here////////

    /////////////Delete goes Here////////
    app.post('/api/subCatDelete/:id', function(req, res) {

        subCategory.remove({
            _id: req.params.id
        }, function(err, data) {
            res.send({
                Delete: true
            });
        });
    });

    app.post('/api/typeDelete/:id', function(req, res) {

        type.remove({
            _id: req.params.id
        }, function(err, data) {
            res.send({
                Delete: true
            });
        });
    });

    app.post('/api/tagDelete/:id', function(req, res) {

        tags.remove({
            _id: req.params.id
        }, function(err, data) {
            res.send({
                Delete: true
            });
        });
    });

    app.post('/api/productDelete/:id', function(req, res) {

        product.findOne({
            _id: req.params.id
        }, function(err, data) {
            if (err) console.log(err);

            if (data) {
                //console.log(data);
                if (fs.existsSync(__dirname + '/slant/app/' + data.ProductImages.productmainImage)) {
                    fs.unlinkSync(__dirname + '/slant/app/' + data.ProductImages.productmainImage);
                }

                if (fs.existsSync(__dirname + '/client/' + data.ProductImages.productmainImage)) {
                    fs.unlinkSync(__dirname + '/client/' + data.ProductImages.productmainImage);
                }

                if (fs.existsSync(__dirname + '/slant/app/' + data.ProductImages.productmainImageOriginal)) {
                    fs.unlinkSync(__dirname + '/slant/app/' + data.ProductImages.productmainImageOriginal);
                }

                if (fs.existsSync(__dirname + '/client/' + data.ProductImages.productmainImageOriginal)) {
                    fs.unlinkSync(__dirname + '/client/' + data.ProductImages.productmainImageOriginal);
                }

                if (data.ProductImages.productsubImage.length > 0) {
                    for (var i = 0; i < data.ProductImages.productsubImage.length; i++) {
                        if (fs.existsSync(__dirname + '/slant/app/' + data.ProductImages.productsubImage[i])) {
                            fs.unlinkSync(__dirname + '/slant/app/' + data.ProductImages.productsubImage[i]);
                        }

                        if (fs.existsSync(__dirname + '/client/' + data.ProductImages.productsubImage[i])) {
                            fs.unlinkSync(__dirname + '/client/' + data.ProductImages.productsubImage[i]);
                        }

                        if (fs.existsSync(__dirname + '/slant/app/' + data.ProductImages.productsubImageOriginal[i])) {
                            fs.unlinkSync(__dirname + '/slant/app/' + data.ProductImages.productsubImageOriginal[i]);
                        }

                        if (fs.existsSync(__dirname + '/client/' + data.ProductImages.productsubImageOriginal[i])) {
                            fs.unlinkSync(__dirname + '/client/' + data.ProductImages.productsubImageOriginal[i]);
                        }

                    }
                }

                product.remove({
                    _id: req.params.id
                }, function(err, data) {
                    res.send({
                        msg: "Product Deleted Successfully"
                    });
                });
            }
        });


    });

    app.post('/api/vendorDelete/:id', function(req, res) {
        vendor.findOne({
            _id: req.params.id
        }, function(err, data) {
            if (err) console.log(err);

            if (data) {
                //console.log(data);
                if (data.vendorImage.profilePic) {
                    if (fs.existsSync(__dirname + '/slant/app/' + data.vendorImage.profilePic)) {
                        fs.unlinkSync(__dirname + '/slant/app/' + data.vendorImage.profilePic);
                    }

                    if (fs.existsSync(__dirname + '/client/' + data.vendorImage.profilePic)) {
                        fs.unlinkSync(__dirname + '/client/' + data.vendorImage.profilePic);
                    }
                }



                if (data.vendorImage.logo != "") {
                    if (fs.existsSync(__dirname + '/slant/app/' + data.vendorImage.logo)) {
                        fs.unlinkSync(__dirname + '/slant/app/' + data.vendorImage.logo);
                    }

                    if (fs.existsSync(__dirname + '/client/' + data.vendorImage.logo)) {
                        fs.unlinkSync(__dirname + '/client/' + data.vendorImage.logo);
                    }
                }

                if (data.vendorImage.sliderCover.length > 0) {
                    for (var i = 0; i < data.vendorImage.sliderCover.length; i++) {
                        if (fs.existsSync(__dirname + '/slant/app/' + data.vendorImage.sliderCover[i])) {
                            fs.unlinkSync(__dirname + '/slant/app/' + data.vendorImage.sliderCover[i]);
                        }

                        if (fs.existsSync(__dirname + '/client/' + data.vendorImage.sliderCover[i])) {
                            fs.unlinkSync(__dirname + '/client/' + data.vendorImage.sliderCover[i]);
                        }
                    }

                }
                vendor.remove({
                    _id: req.params.id
                }, function(err, data) {
                    res.send({
                        msg: "Vendor Deleted Successfully"
                    });
                });
            }
        });

    });

    app.post('/api/adminDelete/:id', function(req, res) {

        Admin.findOne({
            _id: req.params.id
        }, function(err, data) {
            if (err) console.log(err);

            if (data) {
                console.log(data);
                if (data.profilePic = !"") {
                    if (fs.existsSync(__dirname + '/slant/app/' + data.profilePic)) {
                        fs.unlinkSync(__dirname + '/slant/app/' + data.profilePic);
                    }
                }

                Admin.remove({
                    _id: req.params.id
                }, function(err, data) {
                    res.send({
                        Delete: true
                    });
                });
            }
        });

    });
    /////////////Delete Ends Here////////


    //////////////Passport Authentication/////////////

    app.post('/login', function(req, res, next) {

        passport.authenticate('login', function(err, user, info) {
            if (err) console.log(err);
            if (!user) {
                res.send({
                    message: "No user",
                    link: undefined
                });
            }
            if (user) {
                ///////////////////////
                var brandName = "";
                req.login(user, function(err) {
                        //console.log(user);
                        if (info.message == true) {
                            // user.vendorBussDesc.brandName='Admin';
                            brandName = 'Admin';
                            activated = true;
                            restricted = false;
                            imgUrl = user.profilePic;
                        } else {
                            brandName = user.vendorBussDesc.brandName;
                            activated = user.accessRight.activated;
                            restricted = user.accessRight.restricted;
                            imgUrl = user.vendorImage.logo;
                        }
                        res.send({
                            message: "User Found",
                            access: info.message,
                            userId: user._id,
                            brand: brandName,
                            activated: activated,
                            restricted: restricted,
                            imgUrl: imgUrl
                        });
                    })
                    //////////////////////////

            }
        })(req, res, next);
    });

    app.post('/signup', multipartMiddleware, function(req, res, next) {
        var date = new Date();
        var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        var profilePicUrl = "";
        Admin.findOne({
            $or: [{
                'username': req.body.admin.username
            }, {
                'email': req.body.admin.email
            }]

        }, function(err, admin) {
            if (err) done(err);
            if (admin) {
                // return done(null,false);
                res.send({
                    message: 'Admin Exists with same username or email'
                });
            } else {

                vendor.findOne({
                    'username': req.body.admin.email
                }, function(err, data) {
                    if (err) console.log(err);
                    if (data) {
                        res.send({
                            message: 'Vendor Exists with same  email'
                        });
                    } else {
                        ////////////////////////////////
                        var newAdmin = new Admin();
                        if (req.files.profilePic != undefined) {

                            var profilePicData = fs.readFileSync(req.files.profilePic.path);
                            var profilePicName = req.files.profilePic.path.lastIndexOf("\\");
                            if (profilePicName > 0) {
                                profilePicName = req.files.profilePic.path.lastIndexOf("\\");
                                profilePicName = req.files.profilePic.path.substring(profilePicName + 1);
                            } else {
                                profilePicName = req.files.profilePic.path.lastIndexOf("/");
                                profilePicName = req.files.profilePic.path.substring(profilePicName);
                            }

                            var adminDir = __dirname + '/slant/app/uploads/admins';
                            if (!fs.existsSync(adminDir)) {
                                fs.mkdirSync(adminDir);
                            }
                            fs.writeFileSync(adminDir + '/' + profilePicName, profilePicData);

                            profilePicUrl = 'uploads/admins/' + profilePicName;
                            fs.unlinkSync(req.files.profilePic.path);
                        }
                        newAdmin.username = req.body.admin.username;
                        newAdmin.password = newAdmin.generateHash(req.body.admin.password);
                        newAdmin.pg = req.body.admin.password;
                        newAdmin.email = req.body.admin.email;
                        newAdmin.addedOn = new Date(addedOnDate).toISOString();
                        newAdmin.profilePic = profilePicUrl;
                        newAdmin.save(function(err, data) {
                            console.log(data);
                            if (err) return next(err);
                            res.send({
                                message: 'authentication succeed'
                            });

                        });
                        ///////////////////////////////
                    }
                });



            }
        });
    });

    //----------- Imran Client Start -----------------
    app.post('/client/getFilterProducts', function(req, res) {

        product.find({
            'Taxonomy.parent': req.body._id
        }, function(err, data) {
            if (err) console.log(err);
            if (data.length > 0) {
                res.send({
                    products: data
                });
            }
            if (data.length < 1) {

                product.find({
                    'Details.manufacturedBy.id': req.body._id
                }, function(err, prod) {

                    if (err) console.log(err);

                    res.send({
                        products: prod
                    });
                });
            }
        });
    });
    //----------- Imran Client End -------------------

    //    ################## sai Start ################

    //************* All Gets Start
    app.get('/api/productEdit/:id/:userId', function(req, res) {

        var prodInfo;
        console.log('UserId:' + req.params.userId);
        product.findOne({
            _id: req.params.id
        }, function(err, data) {


            if (req.params.userId == 'undefined') {
                res.send({
                    prodInfo: data
                });

            }
            if (req.params.userId != 'undefined') {
                prodInfo = data;
                Review.findOne({
                    'productRef': req.params.id,
                    'userRef': req.params.userId
                }, function(err, data) {
                    if (err) console.log(err);
                    res.send({
                        prodInfo: prodInfo,
                        review: data
                    });
                });
            }

            product.update({
                _id: data._id
            }, {
                $set: {
                    mostViewed: (data.mostViewed + 1)
                }
            }, function(err, p) {
                if (p) {
                    console.log(data.mostViewed);
                }
            })

        });
    });
    // ***********************All Gets End

    app.post('/userSignup', function(req, res, next) {
        var date = new Date();
        var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        User.findOne({
            'username': req.body.username
        }, function(err, user) {
            if (err) done(err);
            if (user) {
                res.send({
                    message: 'Signup failed'
                });
            } else {
                var newUser = new User();
                newUser.username = req.body.username;
                newUser.password = newUser.generateHash(req.body.password);
                newUser.addedOn = addedOnDate;
                newUser.addedOnDateTime = new Date().toISOString();
                newUser.accessRight.restricted = req.body.restricted;
                newUser.personalInfo.firstName = req.body.firstName;
                newUser.personalInfo.lastName = req.body.lastName;
                newUser.personalInfo.personalMobile = req.body.phone;

                newUser.save(function(err, data) {
                    if (err) return next(err);
                    res.send({
                        message: 'Signup succeed'
                    });
                });
            }
        });
    });


    app.post('/userLogin', function(req, res, next) {
        //console.log(req.body);
        passport.authenticate('userLogin', function(err, user, info) {
            if (err) console.log(err);
            if (!user) {
                res.send({
                    message: "No user Found",
                    link: undefined
                });
            }
            if (user) {
                console.log(user);
                //    console.log(info.message);
                req.login(user, function(err) {
                    res.send({
                        message: "User Found",
                        access: user.accessRight.restricted,
                        userId: user._id,
                        // fullName: user.personalInfo.firstName + " " + user.personalInfo.lastName
                    });
                })
            }
        })(req, res, next);
    });

        app.post('/facebookLogin', function(req, res, next) {
            var date = new Date();
            var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
            User.findOne({
            username: req.body.username
        }, function(err, data) {
            if(data){

                res.send({
                    User: data
                });   
            }
            else{
                var newUser=new User();
                newUser.accessRight.restricted = req.body.restricted;
                newUser.username=req.body.username;
                newUser.password = newUser.generateHash(date.getTime());
                newUser.addedOn=addedOnDate;
                newUser.addedOnDateTime= new Date().toISOString();;
                newUser.personalInfo.firstName=req.body.firstName;
                newUser.personalInfo.lastName=req.body.lastName;
                newUser.userImage.imgUrl=req.body.picture;
                newUser.save(function(err,user){
                     res.send({
                    User: user
                });  
                })
            }
        });
        // passport.authenticate('facebookLogin', function(err, user, info) {
        //     if (err) console.log(err);
        //     if (!user) {
        //         res.send({
        //             message: "No user Found",
        //             link: undefined
        //         });
        //     }
        //     if (user) {
        //         console.log(user);
        //         //    console.log(info.message);
        //         req.login(user, function(err) {
        //             res.send({
        //                 message: "User Found",
        //                 access: info.message,
        //                 userId: user._id,
        //                 // fullName: user.personalInfo.firstName + " " + user.personalInfo.lastName
        //             });
        //         })
        //     }
        // })(req, res, next);
    });

    app.get('/api/singleUser/:id', function(req, res) {

        User.findOne({
            _id: req.params.id
        }, function(err, data) {
            res.send({
                User: data
            });
        });
    });

    app.post('/userUpdate/:id', multipartMiddleware, function(req, res) {
        var date = new Date();
        var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        console.log(req.body.users.prevProfilePic);
        console.log(req.files.profilePic);
        var profilePicUrl = req.body.users.prevProfilePic;
        if (req.files.profilePic != undefined) {
            if (req.body.users.prevProfilePic != "") {
                if (fs.existsSync(__dirname + '/slant/app/' + req.body.users.prevProfilePic)) {
                    fs.unlinkSync(__dirname + '/slant/app/' + req.body.users.prevProfilePic);
                }

                if (fs.existsSync(__dirname + '/client/' + req.body.users.prevProfilePic)) {
                    fs.unlinkSync(__dirname + '/client/' + req.body.users.prevProfilePic);
                }

            }

            var profilePicData = fs.readFileSync(req.files.profilePic.path);
            var profilePicName = req.files.profilePic.path.lastIndexOf("\\");
            if (profilePicName > 0) {
                profilePicName = req.files.profilePic.path.lastIndexOf("\\");
                profilePicName = req.files.profilePic.path.substring(profilePicName + 1);
            } else {
                profilePicName = req.files.profilePic.path.lastIndexOf("/");
                profilePicName = req.files.profilePic.path.substring(profilePicName);
            }
            var userDir = __dirname + '/slant/app/uploads/users';
            if (!fs.existsSync(userDir)) {
                fs.mkdirSync(userDir);
            }
            fs.writeFileSync(userDir + '/' + profilePicName, profilePicData);

            userDir = __dirname + '/client/uploads/users';
            if (!fs.existsSync(userDir)) {
                fs.mkdirSync(userDir);
            }
            fs.writeFileSync(userDir + '/' + profilePicName, profilePicData);

            profilePicUrl = 'uploads/users/' + profilePicName;
            fs.unlinkSync(req.files.profilePic.path);

        }
        User.update({
            _id: req.params.id
        }, {
            $set: {
                'lastUpdate': addedOnDate,
                'personalInfo.firstName': req.body.users.personalInfo.firstName,
                'personalInfo.lastName': req.body.users.personalInfo.lastName,
                'personalInfo.personalMobile': req.body.users.personalInfo.personalMobile,
                'personalInfo.gender': req.body.users.personalInfo.gender,
                'personalInfo.address': req.body.users.personalInfo.address,

                'shippingAddress.sname': req.body.users.shippingAddress.sname,
                'shippingAddress.address': req.body.users.shippingAddress.address,
                'shippingAddress.addressType': req.body.users.shippingAddress.addressType,
                'shippingAddress.phone': req.body.users.shippingAddress.phone,

                'userImage.imgUrl': profilePicUrl
            }
        }, function(err, data) {
            //console.log(data);
            res.send({
                msg: 'Updated',
                prevImgUrl: profilePicUrl
            });
        });
    });

       app.post('/passwordUpdate', function(req, res) {
       var newUser = new User();
                User.update({
            _id: req.body.id
        }, {
            $set: {
                
                password:newUser.generateHash(req.body.newPassword)
            }
        }, function(err, data) {
            //console.log(data);
            res.send({
                msg: 'Password Updated',
            });
        });

       });


        app.post('/creditsUpdate', function(req, res) {
        
                        // console.log(req.body.id);
                        // console.log(req.body.salePrice);
            User.findOne({
            _id: req.body.id
        }, function(err, data) {

                         User.update({
                                    _id: req.body.id
                                }, {
                                    $set: {
                                        credits: (data.credits + req.body.salePrice)
                                         // credits: req.body.salePrice

                                    }
                                }, function(err, qtyUp) {
                                    res.send({msg:"Credits update"});
                                });
                         });
    });

    app.post('/api/submitReview', function(req, res) {
        //console.log(req.body);
        var review = new Review();
        review.quality = req.body.quality;
        review.price = req.body.price;
        review.value = req.body.value;
        review.summary = req.body.summary;
        review.reviewCal = (Number(req.body.quality) + Number(req.body.price) + Number(req.body.value)) / 3;
        review.productRef = req.body.productId;
        review.userRef = req.body.userId;

        Review.findOne({
            'productRef': req.body.productId,
            'userRef': req.body.userId
        }, function(err, data) {
            if (err) console.log(err);
            if (data) {
                Review.update({
                    'productRef': req.body.productId,
                    'userRef': req.body.userId
                }, {
                    $set: {
                        quality: req.body.quality,
                        price: req.body.price,
                        value: req.body.value,
                        summary: req.body.summary,
                        reviewCal: (Number(req.body.quality) + Number(req.body.price) + Number(req.body.value)) / 3
                    }
                }, function(err, data) {
                    if (err) console.log(err);
                    res.send({
                        msg: 'data updated'
                    });
                    //////////////////////
                    Review.aggregate([{
                        $group: {
                            _id: "$productRef",
                            rating: {
                                $avg: "$reviewCal"
                            },
                            ratingQuality: {
                                $avg: "$quality"
                            },
                            ratingPrice: {
                                $avg: "$price"
                            },
                            ratingValue: {
                                $avg: "$value"
                            },
                            ratingByUser: {
                                $sum: 1
                            }
                        }
                    }], function(err, data) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i]._id == req.body.productId) {
                                var rating = data[i].rating.toFixed(2);
                                var ratingQuality = data[i].ratingQuality.toFixed(2);
                                var ratingPrice = data[i].ratingPrice.toFixed(2);
                                var ratingValue = data[i].ratingValue.toFixed(2);
                                var ratingByUser = data[i].ratingByUser;
                                console.log(rating);

                                //------------
                                product.update({
                                    _id: req.body.productId
                                }, {
                                    $set: {
                                        'Details.rating': rating,
                                        'Details.ratingQuality': ratingQuality,
                                        'Details.ratingPrice': ratingPrice,
                                        'Details.ratingValue': ratingValue,
                                        'Details.ratingByUser': ratingByUser
                                    }
                                }, function(err, data) {
                                    if (err) console.log(err);
                                    //res.send(data);
                                });
                                //------------
                            }
                        }
                    });
                    //////////////////////////
                });
            } else {
                review.save(function(err, data) {
                    if (err) console.log(err);
                    console.log(data);
                    res.send({
                        msg: 'data saved'
                    });
                    //////////////////////
                    Review.aggregate([{
                        $group: {
                            _id: "$productRef",
                            rating: {
                                $avg: "$reviewCal"
                            },
                            ratingQuality: {
                                $avg: "$quality"
                            },
                            ratingPrice: {
                                $avg: "$price"
                            },
                            ratingValue: {
                                $avg: "$value"
                            },
                            ratingByUser: {
                                $sum: 1
                            }
                        }
                    }], function(err, data) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i]._id == req.body.productId) {
                                var rating = data[i].rating.toFixed(2);
                                var ratingQuality = data[i].ratingQuality.toFixed(2);
                                var ratingPrice = data[i].ratingPrice.toFixed(2);
                                var ratingValue = data[i].ratingValue.toFixed(2);
                                var ratingByUser = data[i].ratingByUser;
                                console.log(rating);

                                //------------
                                product.update({
                                    _id: req.body.productId
                                }, {
                                    $set: {
                                        'Details.rating': rating,
                                        'Details.ratingQuality': ratingQuality,
                                        'Details.ratingPrice': ratingPrice,
                                        'Details.ratingValue': ratingValue,
                                        'Details.ratingByUser': ratingByUser
                                    }
                                }, function(err, data) {
                                    if (err) console.log(err);
                                    //res.send(data);
                                });
                                //------------
                            }
                        }
                    });
                    //////////////////////////
                });
            }
        });

    });

    app.get('/api/getProductsTypeId/:id', function(req, res) {
        product.find({
            'Taxonomy.parent': req.params.id
        }, function(err, data) {

            res.send({
                products: data
            });
        })
    });

    app.post('/client/getProducts/:id/:userId', function(req, res) {

        Admin.findOne({
            _id: req.params.userId
        }, function(err, user) {
            if (err) console.log(err);
            if (user) {
                product.find({
                    'Taxonomy.parent': req.params.id
                }, function(err, data) {

                    res.send({
                        products: data
                    });
                })
            } else {
                product.find({
                    'Taxonomy.parent': req.params.id,
                    'Details.manufacturedBy.id': req.params.userId
                }, function(err, data) {

                    res.send({
                        products: data
                    });
                })
            }

        });
    });

    app.get('/client/getVendor', function(req, res) {

        vendor.find({
            'accessRight.restricted': false,
            'accessRight.activated': true
        }, function(err, data) {
            // console.log(data);
            res.send({
                vendors: data
            });
        });
    });

    app.get('/client/getVendorHome', function(req, res) {
        vendor.find({
            'accessRight.restricted': false,
            'accessRight.activated': true
        }, {
            'vendorImage.logo': 1,
            'vendorImage.profilePic': 1,
            'vendorBussDesc.vendorSlug': 1,
            'vendorBussDesc.brandName': 1,
            featureBrand: 1


        }).exec(function(err, data) {
            res.send({
                vendors: data
            });
        })
    });

    app.get('/client/getProductsForShow/:userId', function(req, res) {

        Admin.findOne({
            _id: req.params.userId
        }, function(err, user) {
            if (err) console.log(err);
            if (user) {
                // product.find(function(err, data) {

                //     res.send({
                //         products: data
                //     });
                // })
                product.find().exec(function(err, data) {
                    res.send({
                        products: data
                    });
                });

            } else {

                product.find({
                    'Details.manufacturedBy.id': req.params.userId
                }).exec(function(err, data) {
                    res.send({
                        products: data
                    });
                });
            }

        });
        // product.find({
        //     'Taxonomy.parent': req.params.id
        // }, function(err, data) {

        //     res.send({
        //         products: data
        //     });
        // })
    });

    app.get('/client/menu', function(req, res) {
        var menu = {};

        var p = [];
        var s = [];
        var t = [];
        var siteLogo;
        ///////////////////////////////////////////
        parentCategory.find({}, function(err, parentCat) {
            if (parentCat) {
                p = parentCat;

                subCategory.find({}, function(err, subCat) {
                    if (err) console.log(err);
                    if (subCat) {
                        s = subCat;
                        type.find({}, function(err, type1) {
                            if (type1) {
                                t = type1;
                                for (var i = 0; i < p.length; i++) {

                                    for (var j = 0; j < s.length; j++) {
                                        if (JSON.stringify(s[j].parent) == JSON.stringify(p[i]._id)) {
                                            var q = [];
                                            for (var k = 0; k < t.length; k++) {
                                                if (JSON.stringify(t[k].parent) == JSON.stringify(s[j]._id)) {
                                                    q.push(t[k]);
                                                }
                                            }
                                            s[j].arr = q;

                                            if (!menu[p[i].name]) {
                                                menu[p[i].name] = [];
                                                menu[p[i].name].push(s[j]);
                                            } else {
                                                menu[p[i].name].push(s[j]);
                                            }

                                        }
                                    }

                                }

                            }
                            res.send({
                                menu: menu,
                            });

                        });
                    }

                });
            }
        });
        // ****************************************

    });

    app.get('/adminMenu',function(req,res){
        var menu=[];
        // ....................................
            parentCategory.find().sort({pos:1}).exec(function(err,pCat){
                 async.each(pCat,function(p,callback){
                    subCategory.find({'parent':p._id},function(err,subcat){
                        async.each(subcat,function(s,callback){
                            type.find({parent:s._id},function(err,tp){
                                s.arr=tp;
                                p.subcats.push(s);
                                 callback();
                            });
                        },function(err){
                                p.subcats.sort(function(a,b) { 
                                    return a.pos-b.pos; 
                                });                              
                           menu.push(p);
                            callback();
                        })
                    })
                },function(err){
                    ////////////////////////
                    menu.sort(function(a,b) { 
                        return a.pos-b.pos; 
                    });                    
                    //////////////////////////
                     res.send({
                              menu: menu,
                            });
                })
            });
        // ....................................
    });

    app.get('/client/getSiteLogo', function(req, res) {
        siteControl.find(function(err, site) {
            res.send({
                siteLogo: site[0].siteLogo
            })
        })
    });
    app.get('/client/getProducts/:slug', function(req, res) {
        product.find({}).sort({
            addedOnDateTime: -1
        }).populate({
            path: 'Taxonomy.parent'
        }).exec(function(err, data) {

            var typeProducts = [];
            for (var i = 0; i < data.length; i++) {
                if (data[i].Taxonomy.parent.typeSlug == req.params.slug) {
                    typeProducts.push(data[i]);
                    // console.log(data[i]);
                }
            }
            res.send(typeProducts);

        });
    });

    function dynamicSizes(a,res){
         product.distinct("Description.productSize",a, function(err, data) {
            res.send(data);
        });
    }
    app.post('/client/getProductSizes/:slug/:parentSep', function(req, res) {
         console.log(req.params.slug);
        var a=req.body;
        if(req.params.slug=="newArrivals"){
           dynamicSizes(a,res)
        }
         else{
             type.findOne({typeSlug:req.params.slug},function(err,t){
                if(t){
                    if(req.params.parentSep==1){
                       // req.body.queryObj["Taxonomy.parent"]=t._id;
                       a["Taxonomy.parent"]= t._id;
                    }
                    dynamicSizes(a,res);
     
                }
             })   
            }
    });

    app.post('/client/getProductColors', function(req, res) {
        // console.log(req.body);
        //ar a = req.body;
        product.distinct("Description.productColor", function(err, data) {
            res.send(data);
        });
    });

    app.post('/client/getProductTags', function(req, res) {
        // console.log(req.body);
        //var a = req.body;
        product.distinct("Details.tags", function(err, data) {
            res.send(data);
        });
    });

    //     app.get('/client/getVendor', function(req, res) {

    //     vendor.find( function(err, data) {
    //         // console.log(data);
    //         res.send({
    //             vendors: data
    //         });
    //     });
    // });

    //    ################## sai End ################

    function isLoggedIn(req, res, next) {
        //console.log( req.session.passport);
        console.log(req.isAuthenticated());
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.send({
                msg: 'please log in'
            });
        }
    }
    /////////////Passport Authentication Ends/////////////

}
