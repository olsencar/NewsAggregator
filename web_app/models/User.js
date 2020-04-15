const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    _id: Schema.Types.ObjectId,
    uid: String,
    comments: { type: Array, default: [] },
    upvotes: { type: Array, default: [] }
});

module.exports = mongoose.model('User', userSchema, 'users');