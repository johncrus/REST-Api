const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require ('body-parser');
const mongoose = require('mongoose');

mongoose.connect('mongodb://admin:admin@cluster0-shard-00-00-jqmu3.mongodb.net:27017,cluster0-shard-00-01-jqmu3.mongodb.net:27017,cluster0-shard-00-02-jqmu3.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin');

const songsRoutes = require('./api/routes/songs');
const albumsRoutes = require('./api/routes/albums');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(function (req,res,next) {
    res.header('Acces-Control-Allow-Origin','*');
    res.header(
        'Acces-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
        );
    if (req.method === 'OPTIONS'){
        res.header('Acces-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use('/songs', songsRoutes);
app.use('/albums', albumsRoutes);

app.use(function (req,res,next) {
    const error = new Error('Not found');
    error.status=404;
    next(error);
});

app.use(function (error,req,res,next) {
    res.status(error.status||500);
    res.json({
        error:{
            message: error.message
        }
    });
});


module.exports=app;