const { model, Schema } = require('mongoose');

const FriendSchema = new Schema({
    owner: {
        type: String,
        require: true,
        unique: true
    },
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});
module.exports = model('Friend', FriendSchema);

