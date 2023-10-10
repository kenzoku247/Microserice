const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema(
    {
        orderCode: {
            type: String,
            required: true,
            unique: true
        },
        platform: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true
        },
        link: {
            type: String,
            required: true
        },
        note: {
            type: String,
            default: ""
        },
        datetime: {
            type: String,
            required: true
        }

    },{
        timestamps: true
    }
)

module.exports = mongoose.model("Orders", orderSchema)