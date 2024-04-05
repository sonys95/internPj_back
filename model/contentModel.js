const mongoose = require("mongoose");


const contentSchema = new mongoose.Schema({
    roomTitle: {
        type: String,
        // ref: 'Room.title',  // 참조하려는 모델과 필드의 경로
        required: false
    },
    nickName: {
        type: String,
        required: false,
    },
    profileImg:{
        type: String
    },
    content: {
        type: String,
        required: false,
    },
    date: {
        type: Date,
        default: Date.now
    },
    image:{
        type: String,
    }

})

module.exports = mongoose.model("content", contentSchema);