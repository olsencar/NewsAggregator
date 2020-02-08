const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    _id: Schema.Types.ObjectId,
    primary_id: String,
    secondary_id: String,
    group_comments: {type: Array, default: []}
});

module.exports = mongoose.model('Comment', commentSchema, 'comments');