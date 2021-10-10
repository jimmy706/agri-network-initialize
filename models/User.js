const { Schema, model } = require('mongoose');

const UserType = {
    SUPPLIER: "Nhà cung cấp",
    PRODUCER: "Hộ sản xuất",
    BUYER: "Người thu mua"
}

const LocationSchema = new Schema({
    lat: {
        type: Number,
        require: true,
        default: -360,
    },
    lng: {
        type: Number,
        require: true,
        default: -360
    }
});

const UserSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    avatar: { type: String, require: false },
    email: { type: String, require: true, unique: true },
    province: { type: String, require: true },
    district: { type: String, require: true, default: "" },
    ward: { type: String, require: true, default: "" },
    phoneNumber: { type: String, require: true },
    type: {
        type: String, enum: [
            UserType.PRODUCER,
            UserType.BUYER,
            UserType.SUPPLIER
        ], require: true, default: UserType.PRODUCER
    },
    location: LocationSchema
});

module.exports = model('User', UserSchema);

