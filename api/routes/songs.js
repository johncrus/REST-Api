const express =require ('express');
const router = express.Router();
const mongoose = require('mongoose');
const Song = require('../models/song');
const Album =require('../models/album');

router.get('/',function(req,res,next) {
    Song.find()
        .select('name price _id album')
        .exec()
        .then(function (value) {
            const response = {
              count: value.length,
              songs: value.map(function (value) {
                  return{
                     name: value.name,
                     price: value.price,
                      _id: value.id,
                      request:{
                         type: 'GET',
                          url: 'http://localhost:3000/songs/'+value.id
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

router.get('/:songId',function (req,res,next) {
    const id = req.params.songId;
    Song.findById(id)
        .exec()
        .then(function (doc) {
            console.log(doc);
            if (doc){
                Album.findById(doc.album).exec().then(
                    function (value) {
                        const response = {
                            name: doc.name,
                            price: doc.price,
                            albumId: doc.album,
                            album_name: value.name,
                            album_request:{
                                type: 'GET',
                                url: 'http://localhost:3000/albums/'+doc.album
                            }
                        };

                        res.status(200).json(response);
                    }
                );

            }else{
                res.status(404).json({message:'No valid entry for that id'});
            }

        })
        .catch(function (err) {
            console.log(err);
            res.status(500).json({error:err});
        });
});
router.put('/',function(req,res,next) {
    if(!req.body){
        return res.status(400).json({
            message: 'No data'
        });
    }else{
        Song.remove().then(function (value) {
            for(var songi in req.body){
                const song = new Song({
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body[songi]["name"],
                    price: req.body[songi]["price"],
                    album: req.body[songi]["album"]
                });
                Album.findById(req.body[songi]["album"])
                    .then(function (album) {
                        if(album.length>0){
                            return res.status(404).json({
                                message: 'Album '+req.body[songi]["album"]+' not found'
                            });
                        }else{

                            song.save(function (err) {
                                if (err)
                                    return res.status(400).json(err);
                            });
                        }
                    });
            }
            return res.status(201).json({
                message: "Songs created"
            });
        });

    }

});
router.put('/:songId',function (req,res,next) {
    const id = req.params.songId;
    Song.findById(id)
        .then(function (song) {
            if(song){
                Song.update({_id:id},{$set:{name: req.body.newName,price:req.body.newPrice,album:req.body.newAlbum}}).exec().then(function (result) {
                    return res.status(200).json({
                        message: 'Succes edit'
                    });
                }).catch(function (reason) { return res.status(500).json({
                    error:reason
                }) });
            } else{
                const song = new Song({
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.newName,
                    price: req.body.newPrice,
                    album: req.body.newAlbum
                });
                song
                    .save()
                    .then(function(result){
                        res.status(201).json({
                            message: 'Object created',
                            createdProduct: {
                                name: result.name,
                                _id: result._id,
                                request:{
                                    type: 'GET',
                                    url: 'http://localhost:3000/songs/'+result.id
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

router.patch('/:songId',function (req,res,next) {
    const id = req.params.songId;

    Song.update({_id : id},{$set: {name:req.body.newName,price:req.body.newPrice}})
        .exec()
        .then(function (value) {
            res.status(200).json({
                message: 'Succes patch',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/songs/'+id
                }
            });
        })
        .catch(function (reason) {
            console.log(reason);
            res.status(500).json({
                error: reason
            })
        });

});
router.delete('/:songId',function (req,res,next) {
    const id = req.params.songId;
    Song.remove({_id : id})
        .exec()
        .then(function (value) {
            res.status(200).json(value);
        })
        .catch(function (reason) {
            console.log(reason);
            res.status(500).json({error: reason});
        });
});
module.exports = router;