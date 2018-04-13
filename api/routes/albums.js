const express =require ('express');
const router = express.Router();
const mongoose= require('mongoose');

const Album = require('../models/album')
const Song = require('../models/song')

router.get('/',function(req,res,next) {
    Album.find()
        .select('name _id')
        .exec()
        .then(function (value) {
            const response = {
                count: value.length,
                albums: value.map(function (value) {
                    return{
                        name: value.name,
                        _id: value.id,
                        request:{
                            type: 'GET',
                            url: 'http://localhost:3000/albums/'+value.id
                        }
                    }
                })
            };

            res.status(200).json(response);
        })
        .catch(function (reason) { console.log(reason);
            res.status(500).json({
                error:reason
            });
        });
});
router.put('/',function (req,res,next) {
    if(!req.body){
        return res.status(400).json({
            message: 'No data'
        });
    } else{
        Album.remove().then(function (result) {
            Song.remove().then(function (result1) {
                for (var albumi in req.body){
                    var id = new mongoose.Types.ObjectId();
                    var album = new Album({
                        _id: id,
                        name: req.body[albumi]["name"]
                    });
                    if(req.body[albumi]["songs"]){
                        for(var songi in req.body[albumi]["songs"] ){
                        var song = new Song({
                            _id: new mongoose.Types.ObjectId(),
                            name: req.body[albumi]["songs"][songi]["name"],
                            price: req.body[albumi]["songs"][songi]["price"],
                            album: id
                        });
                            song.save(function (err) {
                                if(err)
                                    return res.status(400).json(err);
                            });
                        }
                    }
                    album.save(function (err) {
                        if(err)
                            return res.status(400).json(err);
                    });

                }
                return res.status(200).json({
                    message: 'PUT succeded'
                });
            });
        });


    }

});
router.put('/:albumId',function (req,res,next) {
    const id = req.params.albumId;
    Album.findById(id)
        .then(function (album) {
            if(album){
                Album.update({_id:id},{$set:{name: req.body.newName}}).exec().then(function (result) {
                    return res.status(200).json(result);
                }).catch(function (reason) { return res.status(500).json({
                    error:reason
                }) });
            } else{
                const album = new Album({
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.newName
                });
                album
                    .save()
                    .then(function(result){
                        res.status(201).json({
                            message: 'Object created',
                            createdProduct: {
                                name: result.name,
                                _id: result._id,
                                request:{
                                    type: 'GET',
                                    url: 'http://localhost:3000/albums/'+result.id
                                }
                            }
                        });
                    }).catch(function (err) {
                    console.log(err);
                    return res.status(500).json({error: err});

                });
            }

        })
        .catch(function (reason) { res.status(500).json({error: reason}) });

});
router.patch('/:albumId',function (req,res,next) {
    const id = req.params.albumId;

    Album.update({_id : id},{$set:{name:req.body.newName}})
        .exec()
        .then(function (value) {
            res.status(200).json({
                _id: id,
                request:{
                    type: 'GET',
                    url: 'http://localhost:3000/albums/'+id
                }
            });
        })
        .catch(function (reason) {
            console.log(reason);
            res.status(404).json({
                error: reason
            })
        });

});
router.post('/',function(req,res,next) {
    const id=new mongoose.Types.ObjectId();
    const album = new Album({
        _id: id,
        name: req.body.name
    });
    album
        .save()
        .then(function(result){
            if(req.body["songs"]){
                for(var songi in req.body["songs"] ){
                    var song = new Song({
                        _id: new mongoose.Types.ObjectId(),
                        name: req.body["songs"][songi]["name"],
                        price: req.body["songs"][songi]["price"],
                        album: id
                    });
                    song.save(function (err) {
                        if(err)
                            return res.status(400).json(err);
                    });
                }
            }
            res.status(201).json({
                message: 'Object created',
                createdProduct: {
                    name: result.name,
                    _id: result.id,
                    request:{
                        type: 'GET',
                        url: 'http://localhost:3000/albums/'+result.id
                    }
                }
            });
        }).catch(function (err) {
        console.log(err);
        res.status(500).json({error: err});

    });

});

router.post('/:albumId',function(req,res,next) {
    const id = req.params.albumId;
    Album.findById(id)
        .exec()
        .then(function(result){
            if(req.body["songs"]){
                for(var songi in req.body["songs"] ){
                    var song = new Song({
                        _id: new mongoose.Types.ObjectId(),
                        name: req.body["songs"][songi]["name"],
                        price: req.body["songs"][songi]["price"],
                        album: id
                    });
                    song.save(function (err) {
                        if(err)
                            return res.status(400).json(err);
                    });
                }
            }
            res.status(201).json({
                message: 'Object modified',
                createdProduct: {
                    name: result.name,
                    _id: result.id,
                    request:{
                        type: 'GET',
                        url: 'http://localhost:3000/albums/'+result.id
                    }
                }
            });
        }).catch(function (err) {
        console.log(err);
        res.status(404).json({error: err});

    });

});

router.get('/:albumId',function (req,res,next) {
    const id = req.params.albumId;
    const reducer = function(accumulator, currentValue) {return accumulator + currentValue};
    Album.findById(id)
        .exec()
        .then(function (doc) {
            if (doc){
                Song.find({album:id}).exec().then(function (value) {
                    const response = {
                        name: doc.name,
                        _id: doc._id,
                        total_price:value.map(function (value) {return value.price}).reduce(reducer),
                        songs: value.map(function (value) {
                            return{
                                _id: value.id,
                                name: value.name,
                                price: value.price,
                                song_request:{
                                    type: 'GET',
                                    url: 'http://localhost:3000/songs/'+value.id
                                }

                            }
                        })

                    };

                    res.status(200).json(response);
                }).catch(function (reason) {
                    const response = {
                        name: doc.name,
                        _id: doc._id,
                        total_price: 0

                    };
                    return res.status(200).json(response) });

            }else{
                res.status(404).json({message:'No valid entry for that id'});
            }

        })
        .catch(function (err) {
            console.log(err);
            res.status(500).json({error:err});
        });
});
router.delete('/:albumId',function (req,res,next) {
    const id = req.params.albumId;
    Album.remove({_id : id})
        .exec()
        .then(function (value) {
            Song.remove({album:id}).exec().then(function (value2) { res.status(200).json({
                message: "Album deleted"
            }); });
        })
        .catch(function (reason) {
            console.log(reason);
            res.status(500).json({error: reason});
        });
});
router.delete('/',function (req,res,next) {
    Album.remove()
        .exec()
        .then(function (value) {
            Song.remove().exec().then(function (value2) { res.status(200).json({
                message: "Collection deleted"
            }); });
        })
        .catch(function (reason) {
            console.log(reason);
            res.status(500).json({error: reason});
        });
});
module.exports = router;