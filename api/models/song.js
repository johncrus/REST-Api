const mongoose=require('mongoose');

const songSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    price: {type:Number, default:0},
    album: {type: mongoose.Schema.Types.ObjectId,ref:'Album', required: true}
});

module.exports = mongoose.model('Song',songSchema);