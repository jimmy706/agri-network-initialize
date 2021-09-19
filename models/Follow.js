const { model, Schema } = require('mongoose');

const FollowSchema = new Schema({
    owner: {
        type: String,
        require: true,
        unique: true
    },
    followings: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    }],
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    }] 
});

module.exports =  model('Follow', FollowSchema);