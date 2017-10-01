var order = require('../models/orderSchema').Order;
var product = require('../models/productSchema').Product;

module.exports = function(router) {

    router.get('/newArrivals', function(req, res) {
        product.find().sort({
            addedOnDateTime:-1
        }).populate('Taxonomy.parent').exec(function(err,data){
            // console.log(data);
            res.send({
                products:data
            });
        });
    });

    router.get('/newArrivalsType/:id', function(req, res) {
        product.find({'Taxonomy.parent': req.params.id}).sort({
            addedOnDateTime:-1
        }).populate('Taxonomy.parent').exec(function(err,data){
            // console.log(data);
            res.send({
                products:data
            });
        });
    });

        router.get('/parentProducts/:id', function(req, res) {
        product.find({
            'Taxonomy.parentCategory': req.params.id
        }).sort({
            addedOnDateTime:-1
        }).exec(function(err,data){
   
            res.send(data);
        });
    });

}