const { Schema, model } = require('mongoose');

const ProductCategorySchema = new Schema({
    name: {
        type: String,
        require: true,
        unique: true
    },
    views: {
        type: Number,
        require: true,
        default: 0
    }
});

module.exports = model('ProductCategory', ProductCategorySchema);

