// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');

// uploading file with multer
var multer = require('multer');
var uploading = multer({
    dest: 'public/uploads/',
    limits: {
        fieldNameSize: 50,
        files: 1,
        fields: 5,
        fileSize: 1024 * 1024
    },
    rename: function (fieldname, filename) {
        return filename;
    },
    onFileUploadStart: function (file) {
        console.log('Starting file upload process.');
        if (file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
            return false;
        }
    },
    inMemory: true //This is important. It's what populates the buffer.
}).single('file');


var mongoose = require('mongoose');
mongoose.connect('mongodb://lazantsy:mohamad@ds045137.mlab.com:45137/jany_mean'); //  connect our database

var Bear = require('./app/models/bear');

// configure app to use bodyParser()
// this will let us get the data from a POST

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// static files
app.use(express.static('public'));

// multer

console.log(__dirname + '/public/uploads/');


var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router


// middleware to use for all requests
router.use(function (req, res, next) {
    // do logging
    console.log('Something is happening.');
    next();

});


// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({message: 'hooray! welcome to our api yo!'});
});

// more routes for our API will happen here

// on routes that end in /bears
// ----------------------------------------------------

router.route('/bears')
    .post(function (req, res) {
        var bear = new Bear(); // create a new instance of the Bear model
        bear.name = req.body.name; // set the bears name (come from the request)

        // save the bear and check for errors
        bear.save(function (err) {
            if (err) {
                res.send(err);
            }
            res.json({message: 'Bear created!'});
        });

    })

    // get all the bears (accessed at GET http://localhost:8080/api/bears)
    .get(function (req, res) {
        Bear.find(function (err, bears) {
            if (err)
                res.send(err);
            res.json(bears);
        })
    });

// on routes that end in /bears/:bear_id
// ----------------------------------------------------

router.route('/bears/:bear_id')
    // get the bear with that id (accessed at GET http://localhost:8080/api/bears/:bear_id)
    .get(function (req, res) {
        Bear.findById(req.params.bear_id, function (err, bear) {
            if (err)
                res.send(err);
            res.json(bear);
        });
    })
    .put(function (req, res) {
        Bear.findById(req.params.bear_id, function (err, bear) {
            if (err)
                res.send(err);

            bear.name = req.body.name; // update the bears info

            bear.save(function (err) {
                if (err)
                    res.send(err);

                res.json({message: 'Bear updated!'});
            });

        });
    })
    // delete the bear with this id (accessed at DELETE http://localhost:8080/api/bears/:bear_id)
    .delete(function (req, res) {
        Bear.remove({
            _id: req.params.bear_id
        }, function (err) {
            if (err)
                res.send(err);
            res.json({message: 'Successfully deleted!'});
        });
    });

// on routes that end in /api/upload
// ----------------------------------------------------

router.route('/upload')
    .post(function (req, res, next) {

        uploading(req, res, function (err) {
            if (err)
                res.send(err);

            console.log('image : ', req.file);
            console.log('body : ', req.body);
            res.status(204).end();
        })

    });


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
app.listen(port);
console.log('Magic happens on port ' + port);
