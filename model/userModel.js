const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        // ref: 'Room.title',  // 참조하려는 모델과 필드의 경로
        required: false
    },
    nickName: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: false,
    },
    date: {
        type: Date,
        default: Date.now
    },
    profileImg:{
        type: String,
        required: false,
    }

})

module.exports = mongoose.model("user", userSchema);