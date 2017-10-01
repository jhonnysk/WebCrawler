var product = require('../models/productSchema').Product;
var tags = require('../models/productSchema').Tags;

var Admin = require('../models/adminSchema').Admin;
var vendor = require('../models/adminSchema').Vendor;

var parentCategory = require('../models/categorySchema').ParentCategory;
var subCategory = require('../models/categorySchema').SubCategory;
var type = require('../models/categorySchema').Type;

var fs = require('fs');


module.exports = function(router, multipartMiddleware,io) {

    var vendorSaveProfilePic = function(req, profilePicUrl, currentDir, date, newPath, clientPath) {
        var profilePicData = fs.readFileSync(req.files.profilePic.path);
        var profilePicName = req.files.profilePic.path.lastIndexOf("\\");
        if (profilePicName > 0) {
            profilePicName = req.files.profilePic.path.lastIndexOf("\\");
            profilePicName = req.files.profilePic.path.substring(profilePicName + 1);
        } else {
            profilePicName = req.files.profilePic.path.lastIndexOf("/");
            profilePicName = req.files.profilePic.path.substring(profilePicName);
        }




        fs.writeFileSync(newPath + '/' + profilePicName, profilePicData);
        fs.writeFileSync(clientPath + '/' + profilePicName, profilePicData);


        var mainImgPath = newPath.lastIndexOf('/uploads');
        mainImgPath = newPath.substring(mainImgPath + 1);
        ////////////////////////////////////////                                                                                
        profilePicUrl = mainImgPath + '/' + profilePicName;
        fs.unlinkSync(req.files.profilePic.path);
        return profilePicUrl;
    }

    var vendorSaveLogo = function(req, logoUrl, currentDir, date, newPath, clientPath) {
        var logoData = fs.readFileSync(req.files.logo.path);
        var logoName = req.files.logo.path.lastIndexOf("\\");

        if (logoName > 0) {
            logoName = req.files.logo.path.lastIndexOf("\\");
            logoName = req.files.logo.path.substring(logoName + 1);
        } else {
            logoName = req.files.logo.path.lastIndexOf("/");
            logoName = req.files.logo.path.substring(logoName);
        }

        fs.writeFileSync(newPath + '/' + logoName, logoData);
        fs.writeFileSync(clientPath + '/' + logoName, logoData);


        var logoPath = newPath.lastIndexOf('/uploads');
        logoPath = newPath.substring(logoPath + 1);
        //////////////////////////////////////// 

        logoUrl = logoPath + '/' + logoName;
        fs.unlinkSync(req.files.logo.path);
        return logoUrl;
    }

    router.post('/vendorSave', multipartMiddleware, function(req, res) {
        var date = new Date();
        var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        var currentDir = __dirname.lastIndexOf('\\');
        if (currentDir > 0) {
            currentDir = __dirname.substring(0, currentDir);
        } else {
            currentDir = __dirname.lastIndexOf('/');
            currentDir = __dirname.substring(0, currentDir);
        }

        Admin.findOne({
            'email': req.body.vendor.email
        }, function(err, data) {
            if (err) console.log(err);
            if (data) {
                res.send({
                    msg: "Admin Exists with same email ID"
                });
            } else {

                vendor.findOne({
                    $or: [{
                        username: req.body.vendor.email
                    }, {
                        'vendorBussDesc.brandName': req.body.vendor.brandName.trim()
                    }]
                }, function(err, user) {
                    if (err) console.log(err);
                    if (user) {
                        res.send({
                            msg: "Vendor Exists"
                        });
                    } else {
                        var profilePicUrl = "";
                        var logoUrl = "";
                        ////////////////////////////////////////
                        var yr = date.getFullYear().toString();
                        var mon = (date.getMonth() + 1).toString();



                        var newPath = currentDir + '/slant/app/uploads/vendors';
                        var clientPath = currentDir + '/client/uploads/vendors';
                        if (!fs.existsSync(newPath)) {
                            fs.mkdirSync(newPath);
                        }

                        if (!fs.existsSync(clientPath)) {
                            fs.mkdirSync(clientPath);
                        }

                        // newPath = newPath + '/' + yr;
                        // clientPath = clientPath + '/' + yr;
                        // if (!fs.existsSync(newPath)) {
                        //     fs.mkdirSync(newPath);
                        // }
                        // if (!fs.existsSync(clientPath)) {
                        //     fs.mkdirSync(clientPath);
                        // }

                        // newPath = newPath + '/' + mon;
                        // clientPath = clientPath + '/' + mon;

                        // if (!fs.existsSync(newPath)) {
                        //     fs.mkdirSync(newPath);
                        // }

                        // if (!fs.existsSync(clientPath)) {
                        //     fs.mkdirSync(clientPath);
                        // }

                        // var names = fs.readdirSync(newPath);
                        // var folders = 0;

                        // for (var i = 0; i < names.length; i++) {

                        //     if (fs.statSync(newPath + '/' + names[i]).isDirectory()) {
                        //         folders++;

                        //     }

                        // }
                        // folders = (folders + 1).toString();
                        // newPath = newPath + '/' + folders;
                        // clientPath = clientPath + '/' + folders;

                        // if (!fs.existsSync(newPath)) {
                        //     fs.mkdirSync(newPath);
                        // }

                        // if (!fs.existsSync(clientPath)) {
                        //     fs.mkdirSync(clientPath);
                        // }
                        if (req.files.profilePic != undefined && req.files.logo == undefined) {
                            profilePicUrl = vendorSaveProfilePic(req, profilePicUrl, currentDir, date, newPath, clientPath);

                        }

                        if (req.files.profilePic == undefined && req.files.logo != undefined) {

                            logoUrl = vendorSaveLogo(req, logoUrl, currentDir, date, newPath, clientPath);

                        }

                        if (req.files.profilePic != undefined && req.files.logo != undefined) {
                            profilePicUrl = vendorSaveProfilePic(req, profilePicUrl, currentDir, date, newPath, clientPath);
                            logoUrl = vendorSaveLogo(req, logoUrl, currentDir, date, newPath, clientPath);
                            console.log('logo Url:   ' + logoUrl);
                        }

                        var vendor1 = new vendor();
                        vendor1.username = req.body.vendor.email;
                        vendor1.password = vendor1.generateHash(req.body.vendor.password);
                        vendor1.pg = req.body.vendor.password;
                        vendor1.addedOn = new Date(addedOnDate).toISOString();
                        vendor1.addedOnDateTime = new Date().toISOString();

                        vendor1.accessRight.activated = req.body.vendor.activated;
                        vendor1.accessRight.restricted = req.body.vendor.restricted;

                        vendor1.personalInfo.firstName = req.body.vendor.firstName;
                        vendor1.personalInfo.lastName = req.body.vendor.lastName;
                        vendor1.personalInfo.personalMobile = req.body.vendor.personalMobile;
                        vendor1.personalInfo.resAddress1 = req.body.vendor.resAddress1;
                        vendor1.personalInfo.resAddress2 = req.body.vendor.resAddress2;

                        vendor1.vendorBussDesc.vendorType = req.body.vendor.vendorType;
                        vendor1.vendorBussDesc.brandName = req.body.vendor.brandName;
                        vendor1.vendorBussDesc.vendorSlug = req.body.vendor.vendorSlug;
                        vendor1.vendorBussDesc.busAddress1 = req.body.vendor.busAddress1;
                        vendor1.vendorBussDesc.busAddress2 = req.body.vendor.busAddress2;
                        vendor1.vendorBussDesc.busPhone = req.body.vendor.busPhone;
                        vendor1.vendorBussDesc.nid = req.body.vendor.nid;
                        vendor1.vendorBussDesc.busDesc = req.body.vendor.busDesc;

                        vendor1.vendorImage.profilePic = profilePicUrl;
                        vendor1.vendorImage.logo = logoUrl;
                        vendor1.save(function(err, data) {
                            if (err) console.log(err);
                            else {
                                res.send({
                                    msg: 'Vendor Added Successfully'
                                });
                                io.sockets.emit('welcome');
                            }
                        });

                    }
                });

            }
        });

    });


    router.post('/editVendor/:id', multipartMiddleware, function(req, res) {
        // var date = new Date();
        // var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        // vendor.update({},{$set:{
        //                 'commission.status':'approved',
        //                 'commission.prevCommission':0,
        //                 'commission.tempCommission':0,
                            // 'commission.newCommission':0,
        //                 'commission.commissionApprovedDate':addedOnDate,
        //                 'commission.commissionApprovedTime':new Date().toISOString()
        //             }},{multi:true},function(err,data){
        //                 console.log(data);
                       
        //             });
        var profilePicUrl;
        var logoUrl;
        var currentDir = __dirname.lastIndexOf('\\');
        if (currentDir > 0) {
            currentDir = __dirname.substring(0, currentDir);
        } else {
            currentDir = __dirname.lastIndexOf('/');
            currentDir = __dirname.substring(0, currentDir);
        }
        var adminPath = currentDir + '/slant/app/uploads/vendors/';
        var clientPath = currentDir + '/client/uploads/vendors/';
        if (req.body.vendor.prevProfilepic == req.body.profilePic) {
            profilePicUrl = req.body.profilePic;
        } else {

            if (fs.existsSync(currentDir + '/slant/app/' + req.body.vendor.prevProfilepic)) {
                fs.unlinkSync(currentDir + '/slant/app/' + req.body.vendor.prevProfilepic);
            }

            if (fs.existsSync(currentDir + '/client/' + req.body.vendor.prevProfilepic)) {
                fs.unlinkSync(currentDir + '/client/' + req.body.vendor.prevProfilepic);
            }

            if (req.body.profilePic == undefined || req.body.profilePic == "undefined" || req.body.profilePic == "" || req.body.profilePic == null) {} else {
                var date = new Date();
                var base64Data = req.body.profilePic.replace(/^data:image\/png;base64,/, "");
                fs.writeFileSync(adminPath + date.getTime() + '.jpg', base64Data, 'base64');
                fs.writeFileSync(clientPath + '/' + date.getTime() + '.jpg', base64Data, 'base64');
                profilePicUrl = 'uploads/vendors/' + date.getTime() + '.jpg';

            }

        }

        if (req.body.vendor.prevLogo == req.body.logo) {
            logoUrl = req.body.logo;
        } else {
            if (fs.existsSync(currentDir + '/slant/app/' + req.body.vendor.prevLogo)) {
                fs.unlinkSync(currentDir + '/slant/app/' + req.body.vendor.prevLogo);
            }

            if (fs.existsSync(currentDir + '/client/' + req.body.vendor.prevLogo)) {
                fs.unlinkSync(currentDir + '/client/' + req.body.vendor.prevLogo);
            }
            if (req.body.logo == undefined || req.body.logo == "undefined" || req.body.logo == "" || req.body.logo == null) {} else {
                var date = new Date();
                var base64Data = req.body.logo.replace(/^data:image\/png;base64,/, "");
                fs.writeFileSync(adminPath + date.getTime() + '.jpg', base64Data, 'base64');
                fs.writeFileSync(clientPath + '/' + date.getTime() + '.jpg', base64Data, 'base64');
                logoUrl = 'uploads/vendors/' + date.getTime() + '.jpg';

            }
        }

        var date = new Date();
        var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        var openSlider=(req.body.vendor.vendorImage.openCover==1?0:1);
        vendor.update({
                _id: req.params.id
            }, {
                $set: {
                    username: req.body.vendor.username,
                    lastUpdate: new Date(addedOnDate).toISOString(),
                    'personalInfo.firstName': req.body.vendor.personalInfo.firstName,
                    'personalInfo.lastName': req.body.vendor.personalInfo.lastName,
                    'personalInfo.personalMobile': req.body.vendor.personalInfo.personalMobile,
                    'personalInfo.resAddress1': req.body.vendor.personalInfo.resAddress1,
                    'personalInfo.resAddress2': req.body.vendor.personalInfo.resAddress2,

                    'vendorBussDesc.vendorType': req.body.vendor.vendorBussDesc.vendorType,
                    'vendorBussDesc.brandName': req.body.vendor.vendorBussDesc.brandName,
                    'vendorBussDesc.vendorSlug': req.body.vendor.vendorBussDesc.vendorSlug,
                    'vendorBussDesc.busAddress1': req.body.vendor.vendorBussDesc.busAddress1,
                    'vendorBussDesc.busAddress2': req.body.vendor.vendorBussDesc.busAddress2,
                    'vendorBussDesc.busPhone': req.body.vendor.vendorBussDesc.busPhone,
                    'vendorBussDesc.nid': req.body.vendor.vendorBussDesc.nid,
                    'vendorBussDesc.busDesc': req.body.vendor.vendorBussDesc.busDesc,

                    'featureBrand': req.body.vendor.featureBrand,

                    'vendorImage.profilePic': profilePicUrl,
                    'vendorImage.logo': logoUrl,

                    'vendorImage.openCover':req.body.vendor.vendorImage.openCover,
                    'vendorImage.openSlider':openSlider    
                }
            },
            function(err, data) {
                product.update({
                    'Details.manufacturedBy.id': req.params.id
                }, {
                    $set: {
                        'Details.manufacturedBy.brand': req.body.vendor.vendorBussDesc.brandName
                    }
                },{multi:true}, function(err, data) {
                    res.send({
                        msg: 'Vendor Edited Successfully'
                    });
                    if (req.body.vendor.featureBrand == 1) {
                        vendor.update({}, {
                            $set: {
                                'featureBrand': 0
                            }
                        }, {
                            multi: true
                        }, function(err, data) {
                            vendor.update({
                                _id: req.params.id
                            }, {
                                $set: {
                                    'featureBrand': req.body.vendor.featureBrand
                                }
                            }, function(err, data) {

                            })
                        });
                    }
                });
            });
        // });

    });

    router.post('/saveSliderCover/:vendorId', function(req, res) {
        var sliderCoverUrl = [];
        var currentDir = __dirname.lastIndexOf('\\');
        if (currentDir > 0) {
            currentDir = __dirname.substring(0, currentDir);
        } else {
            currentDir = __dirname.lastIndexOf('/');
            currentDir = __dirname.substring(0, currentDir);
        }
        var adminPath = currentDir + '/slant/app/uploads/vendors/';
        var clientPath = currentDir + '/client/uploads/vendors/';
        vendor.findOne({
            _id: req.params.vendorId
        }, function(err, v) {

            if (v) {

                for (var i = 0; i < req.body.covers.length; i++) {
                    if (req.body.prevSliderCover.length > 0) {
                        if (req.body.prevSliderCover[i] == req.body.covers[i]) {
                            sliderCoverUrl.push(req.body.covers[i]);
                        } else {
                            if (fs.existsSync(currentDir + '/slant/app/' + req.body.prevSliderCover[i])) {

                                fs.unlinkSync(currentDir + '/slant/app/' + req.body.prevSliderCover[i]);
                            }
                            if (fs.existsSync(currentDir + '/client/' + req.body.prevSliderCover[i])) {
                                fs.unlinkSync(currentDir + '/client/' + req.body.prevSliderCover[i]);
                            }

                            if (req.body.covers[i] == "#") {

                            } else {
                                var date = new Date();
                                var base64Data = req.body.covers[i].replace(/^data:image\/png;base64,/, "");
                                fs.writeFileSync(adminPath + date.getTime() + '.jpg', base64Data, 'base64');
                                fs.writeFileSync(clientPath + '/' + date.getTime() + '.jpg', base64Data, 'base64');
                                sliderCoverUrl.push('uploads/vendors/' + date.getTime() + '.jpg');
                            }


                        }
                    }

                    if (req.body.prevSliderCover.length < 1) {
                        if (req.body.covers[i] == undefined || req.body.covers[i] == 'undefined' || req.body.covers[i] == null || req.body.covers[i] == "" || req.body.covers[i] == "null" || req.body.covers[i] == "#") {

                        } else {

                            var date = new Date();
                            var base64Data = req.body.covers[i].replace(/^data:image\/png;base64,/, "");
                            fs.writeFileSync(adminPath + date.getTime() + '.jpg', base64Data, 'base64');
                            fs.writeFileSync(clientPath + '/' + date.getTime() + '.jpg', base64Data, 'base64');
                            sliderCoverUrl.push('uploads/vendors/' + date.getTime() + '.jpg');
                        }
                    }

                }

                var openCover=(req.body.openSlider==1?0:1);
                vendor.update({
                    _id: req.params.vendorId
                }, {
                    $set: {
                        'vendorImage.sliderCover': sliderCoverUrl,
                        'vendorImage.openSlider': req.body.openSlider,
                        'vendorImage.openCover':openCover
                    }
                }, function(err, data) {
                    res.send({
                        msg: 'Image Saved'
                    })
                });
            } else {
                res.send({
                    msg: 'No Vendor'
                })
            }
        })

    });
    
    router.post('/saveSection1Images/:vendorId', function(req, res) {

        var image1 = "#";
        var image2 = "#";
        var image3 = "#";

        var currentDir = __dirname.lastIndexOf('\\');
        if (currentDir > 0) {
            currentDir = __dirname.substring(0, currentDir);
        } else {
            currentDir = __dirname.lastIndexOf('/');
            currentDir = __dirname.substring(0, currentDir);
        }
        var adminPath = currentDir + '/slant/app/uploads/vendors/';
        var clientPath = currentDir + '/client/uploads/vendors/';
        vendor.findOne({
            _id: req.params.vendorId
        }, function(err, v) {

            if (v) {

                if (req.body.prevImage1 == req.body.image1) {
                    image1 = req.body.image1;
                } else {
                    if (fs.existsSync(currentDir + '/slant/app/' + req.body.prevImage1)) {

                        fs.unlinkSync(currentDir + '/slant/app/' + req.body.prevImage1);
                    }
                    if (fs.existsSync(currentDir + '/client/' + req.body.prevImage1)) {
                        fs.unlinkSync(currentDir + '/client/' + req.body.prevImage1);
                    }

                    if (req.body.image1 == "#" || req.body.image1 == undefined || req.body.image1 == null || req.body.image1 == "") {

                    } else {
                        var date = new Date();
                        var base64Data = req.body.image1.replace(/^data:image\/png;base64,/, "");
                        fs.writeFileSync(adminPath + date.getTime() + '.jpg', base64Data, 'base64');
                        fs.writeFileSync(clientPath + '/' + date.getTime() + '.jpg', base64Data, 'base64');
                        image1 = 'uploads/vendors/' + date.getTime() + '.jpg';
                    }

                }

                if (req.body.prevImage2 == req.body.image2) {
                    image2 = req.body.image2;
                } else {
                    if (fs.existsSync(currentDir + '/slant/app/' + req.body.prevImage2)) {

                        fs.unlinkSync(currentDir + '/slant/app/' + req.body.prevImage2);
                    }
                    if (fs.existsSync(currentDir + '/client/' + req.body.prevImage2)) {
                        fs.unlinkSync(currentDir + '/client/' + req.body.prevImage2);
                    }

                    if (req.body.image2 == "#" || req.body.image2 == undefined || req.body.image2 == null || req.body.image2 == "") {

                    } else {
                        var date = new Date();
                        var base64Data = req.body.image2.replace(/^data:image\/png;base64,/, "");
                        fs.writeFileSync(adminPath + date.getTime() + '.jpg', base64Data, 'base64');
                        fs.writeFileSync(clientPath + '/' + date.getTime() + '.jpg', base64Data, 'base64');
                        image2 = 'uploads/vendors/' + date.getTime() + '.jpg';
                    }

                }
                if (req.body.prevImage3 == req.body.image3) {
                    image3 = req.body.image3;
                } else {
                    if (fs.existsSync(currentDir + '/slant/app/' + req.body.prevImage3)) {

                        fs.unlinkSync(currentDir + '/slant/app/' + req.body.prevImage3);
                    }
                    if (fs.existsSync(currentDir + '/client/' + req.body.prevImage3)) {
                        fs.unlinkSync(currentDir + '/client/' + req.body.prevImage3);
                    }

                    if (req.body.image3 == "#" || req.body.image3 == undefined || req.body.image3 == null || req.body.image3 == "") {

                    } else {
                        var date = new Date();
                        var base64Data = req.body.image3.replace(/^data:image\/png;base64,/, "");
                        fs.writeFileSync(adminPath + date.getTime() + '.jpg', base64Data, 'base64');
                        fs.writeFileSync(clientPath + '/' + date.getTime() + '.jpg', base64Data, 'base64');
                        image3 = 'uploads/vendors/' + date.getTime() + '.jpg';
                    }

                }
               
                vendor.update({
                    _id: req.params.vendorId
                }, {
                    $set: {
                        'vendorImage.section1.image1.imgUrl': image1,
                        'vendorImage.section1.image2.imgUrl': image2,
                        'vendorImage.section1.image3.imgUrl': image3,

                        'vendorImage.section1.image1.cat': req.body.type1,
                        'vendorImage.section1.image2.cat': req.body.type2,
                        'vendorImage.section1.image3.cat': req.body.type3,

                        'vendorImage.section1.openSection1': req.body.openSection1,
                        
                    }
                }, function(err, data) {
                    res.send({
                        msg: 'Image Saved'
                    })
                });
            } else {
                res.send({
                    msg: 'No Vendor'
                })
            }
        })

    });

    router.post('/saveSection2Images/:vendorId', function(req, res) {

        var image1 = "#";
        var image2 = "#";
        var image3 = "#";
        var image4 = "#";

        var currentDir = __dirname.lastIndexOf('\\');
        if (currentDir > 0) {
            currentDir = __dirname.substring(0, currentDir);
        } else {
            currentDir = __dirname.lastIndexOf('/');
            currentDir = __dirname.substring(0, currentDir);
        }
        var adminPath = currentDir + '/slant/app/uploads/vendors/';
        var clientPath = currentDir + '/client/uploads/vendors/';
        vendor.findOne({
            _id: req.params.vendorId
        }, function(err, v) {

            if (v) {

                if (req.body.prevImage1 == req.body.image1) {
                    image1 = req.body.image1;
                } else {
                    if (fs.existsSync(currentDir + '/slant/app/' + req.body.prevImage1)) {

                        fs.unlinkSync(currentDir + '/slant/app/' + req.body.prevImage1);
                    }
                    if (fs.existsSync(currentDir + '/client/' + req.body.prevImage1)) {
                        fs.unlinkSync(currentDir + '/client/' + req.body.prevImage1);
                    }

                    if (req.body.image1 == "#" || req.body.image1 == undefined || req.body.image1 == null || req.body.image1 == "") {

                    } else {
                        var date = new Date();
                        var base64Data = req.body.image1.replace(/^data:image\/png;base64,/, "");
                        fs.writeFileSync(adminPath + date.getTime() + '.jpg', base64Data, 'base64');
                        fs.writeFileSync(clientPath + '/' + date.getTime() + '.jpg', base64Data, 'base64');
                        image1 = 'uploads/vendors/' + date.getTime() + '.jpg';
                    }

                }

                if (req.body.prevImage2 == req.body.image2) {
                    image2 = req.body.image2;
                } else {
                    if (fs.existsSync(currentDir + '/slant/app/' + req.body.prevImage2)) {

                        fs.unlinkSync(currentDir + '/slant/app/' + req.body.prevImage2);
                    }
                    if (fs.existsSync(currentDir + '/client/' + req.body.prevImage2)) {
                        fs.unlinkSync(currentDir + '/client/' + req.body.prevImage2);
                    }

                    if (req.body.image2 == "#" || req.body.image2 == undefined || req.body.image2 == null || req.body.image2 == "") {

                    } else {
                        var date = new Date();
                        var base64Data = req.body.image2.replace(/^data:image\/png;base64,/, "");
                        fs.writeFileSync(adminPath + date.getTime() + '.jpg', base64Data, 'base64');
                        fs.writeFileSync(clientPath + '/' + date.getTime() + '.jpg', base64Data, 'base64');
                        image2 = 'uploads/vendors/' + date.getTime() + '.jpg';
                    }

                }
                if (req.body.prevImage3 == req.body.image3) {
                    image3 = req.body.image3;
                } else {
                    if (fs.existsSync(currentDir + '/slant/app/' + req.body.prevImage3)) {

                        fs.unlinkSync(currentDir + '/slant/app/' + req.body.prevImage3);
                    }
                    if (fs.existsSync(currentDir + '/client/' + req.body.prevImage3)) {
                        fs.unlinkSync(currentDir + '/client/' + req.body.prevImage3);
                    }

                    if (req.body.image3 == "#" || req.body.image3 == undefined || req.body.image3 == null || req.body.image3 == "") {

                    } else {
                        var date = new Date();
                        var base64Data = req.body.image3.replace(/^data:image\/png;base64,/, "");
                        fs.writeFileSync(adminPath + date.getTime() + '.jpg', base64Data, 'base64');
                        fs.writeFileSync(clientPath + '/' + date.getTime() + '.jpg', base64Data, 'base64');
                        image3 = 'uploads/vendors/' + date.getTime() + '.jpg';
                    }

                }
                if (req.body.prevImage4 == req.body.image4) {
                    image4 = req.body.image4;
                } else {
                    if (fs.existsSync(currentDir + '/slant/app/' + req.body.prevImage4)) {

                        fs.unlinkSync(currentDir + '/slant/app/' + req.body.prevImage4);
                    }
                    if (fs.existsSync(currentDir + '/client/' + req.body.prevImage4)) {
                        fs.unlinkSync(currentDir + '/client/' + req.body.prevImage4);
                    }

                    if (req.body.image4 == "#" || req.body.image4 == undefined || req.body.image4 == null || req.body.image4 == "") {

                    } else {
                        var date = new Date();
                        var base64Data = req.body.image4.replace(/^data:image\/png;base64,/, "");
                        fs.writeFileSync(adminPath + date.getTime() + '.jpg', base64Data, 'base64');
                        fs.writeFileSync(clientPath + '/' + date.getTime() + '.jpg', base64Data, 'base64');
                        image4 = 'uploads/vendors/' + date.getTime() + '.jpg';
                    }

                }



                vendor.update({
                    _id: req.params.vendorId
                }, {
                    $set: {
                        'vendorImage.section2.image1.imgUrl': image1,
                        'vendorImage.section2.image2.imgUrl': image2,
                        'vendorImage.section2.image3.imgUrl': image3,
                        'vendorImage.section2.image4.imgUrl': image4,

                        'vendorImage.section2.image1.cat': req.body.type1,
                        'vendorImage.section2.image2.cat': req.body.type2,
                        'vendorImage.section2.image3.cat': req.body.type3,
                        'vendorImage.section2.image4.cat': req.body.type4,

                        'vendorImage.section2.openSection2': req.body.openSection2
                    }
                }, function(err, data) {
                    res.send({
                        msg: 'Image Saved'
                    })
                });
            } else {
                res.send({
                    msg: 'No Vendor'
                })
            }
        })

    });
    
    router.post('/allCategories',function(req,res){
        parentCategory.find({},function(err,parents){
            //if(parents){
               // subCategory.find({},function(err,subCat){
                    type.find({}).populate('parent').exec(function(err,types){
                    res.send({parents:parents,types:types});
                });  
           //  });
                              
           // }
        });
    });

    router.post('/setCommission/:vendorId',function(req,res){
        // console.log(req.params.vendorId);
        console.log(req.body);
        var date = new Date();
        var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        // 
        ///////////////////
           vendor.update({
                    _id: req.params.vendorId
                }, {
                    $set: {
                'commission.status':'pending',      
                // 'commission.prevCommission':0,
                'commission.tempCommission':req.body.prevCommission,
                'commission.newCommission':req.body.newCommission,
                'commission.commissionSetDate':new Date(addedOnDate).toISOString(),
                'commission.commissionSetTime':new Date().toISOString(),

                }}
                , function(err, data) {
                    //console.log(data);
                    res.send({
                        msg: 'Commission Pending'
                    })
                });
        });

        
    //////////////////////////////////////////

    // **************All Gets Starts**************
        router.get('/getPendingCommission',function(req,res){
            vendor.find({'commission.status':'pending'}).sort({'commission.commissionSetTime':-1}).exec(function(err,v){
                res.send({
                    vendors:v
                })
            });
        });

        router.get('/getApprovedCommission',function(req,res){
            vendor.find({'commission.status':'approved'}).sort({'commission.commissionApprovedTime':-1}).exec(function(err,v){
                res.send({
                    vendors:v
                })
            });
        });

        router.get('/approveCommission/:vendorId',function(req,res){
            console.log(req.params.vendorId);
            var vendor1;
             var date = new Date();
        var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
                vendor.findOne({_id:req.params.vendorId},function(err,v){
                    // console.log(v);
                    vendor1=v;
                    vendor.update({_id:req.params.vendorId},{$set:{
                        'commission.status':'approved',
                        'commission.prevCommission':vendor1.commission.newCommission,
                        'commission.tempCommission':vendor1.commission.newCommission,
                        'commission.commissionApprovedDate':new Date(addedOnDate).toISOString(),
                        'commission.commissionApprovedTime':new Date().toISOString()
                    }},function(err,data){
                        console.log(data);
                        res.send(data);
                    })
                });
        });

  router.get('/cancelCommission/:vendorId',function(req,res){
            console.log(req.params.vendorId);
            var vendor1;
             var date = new Date();
        var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
                vendor.findOne({_id:req.params.vendorId},function(err,v){
                    // console.log(v);
                    vendor1=v;
                    vendor.update({_id:req.params.vendorId},{$set:{
                        'commission.status':'approved',
                        'commission.prevCommission':vendor1.commission.prevCommission,
                        'commission.newCommission':vendor1.commission.prevCommission,
                        'commission.commissionApprovedDate':new Date(addedOnDate).toISOString(),
                        'commission.commissionApprovedTime':new Date().toISOString()
                    }},function(err,data){
                        // console.log(data);
                        res.send(data);
                    })
                });
        });

    // **************All Gets Ends**************

}