const { model, Schema } = require('mongoose');

const PostTagSchema = new Schema({
    name: {
        type: String,
        unique: true,
        require: true,
        length: 24
    }
});
module.exports = model('PostTag', PostTagSchema);
