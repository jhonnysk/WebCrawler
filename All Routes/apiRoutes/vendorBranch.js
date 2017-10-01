var Admin = require('../models/adminSchema').Admin;
var vendor = require('../models/adminSchema').Vendor;
var branch = require('../models/adminSchema').VendorBranch;

module.exports=function(router){
    router.post('/addBranch/:vendorId', function(req, res) {
         var date = new Date();
        var addedOnDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        console.log(req.params.vendorId);
        console.log(req.body);
        console.log(new Date(addedOnDate).toISOString());

        var b=new branch();
        b.branchName=req.body.bName;
        b.address=req.body.address;
        b.phone=req.body.phone;
        b.vendorRef=req.params.vendorId;
        b.addedOn=new Date(addedOnDate).toISOString();

        b.save(function(err,data){
            if(err)console.log(err);
            if(data){
                res.send({
                    branch:data
                });
            }
        });
        
    });

    router.get('/getBranches/:vendorSlug',function(req,res){
        vendor.findOne({
            'vendorBussDesc.vendorSlug': req.params.vendorSlug
        }, function(err, data) {

            if(data){
              branch.find({vendorRef:data._id}).populate('vendorRef').exec(function(err,br){
            // console.log(data);
            res.send({
                branches:br
            });
        });
            }
            
        });
   
    });

        router.get('/getBranches1/:vendorId',function(req,res){
              branch.find({vendorRef:req.params.vendorId}).populate('vendorRef').exec(function(err,data){
            // console.log(data);
            res.send({
                branches:data
            });
         });  
        });

    router.post('/editBranche',function(req,res){
      branch.update({_id:req.body.branchId},{
        $set:{
            branchName: req.body.branchName,
            address: req.body.address,
            phone: req.body.phone 
        }
      },function(err,data){
        if(err) console.log(err);
        console.log(data);
        res.send(data);
      });  
    });
}
