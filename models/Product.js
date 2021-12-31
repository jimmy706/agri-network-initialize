const { Schema, model } = require('mongoose');

const QuantityType = {
    POUND: 'Tấn',
    WEIGHT: 'Tạ',
    STONE: 'Yến',
    KG: 'Kg',
    GRAM: 'Gram',
    REGULAR: 'Cái',
};

function limitCategories(val) {
    return val.length <= 3;
}

const ProductSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true,
        default: 1000
    },
    categories: {
        type: [{
            type: Schema.Types.ObjectId,
            require: true,
            ref: 'ProductCategory',        
        }],
        validate: [limitCategories, 'Maximum number of categories']
    },
    quantity: {
        type: Number,
        default: 1
    },
    quantityType: {
        type: String,
        require: true,
        default: QuantityType.REGULAR,
        enum: [
            QuantityType.POUND,
            QuantityType.WEIGHT,
            QuantityType.STONE,
            QuantityType.KG,
            QuantityType.GRAM,
            QuantityType.REGULAR
        ]
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    createdDate: {
        type: Date,
        require: true,
        default: new Date()
    },
    views: {
        tpye: Number,
        require: false,
        default: 0
    },
    thumbnails: {
        type: [String],
        require: false,
        default: []
    }
});

const ProductModel = model('Product', ProductSchema);

module.exports = ProductModel;