const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const CommentSchema = new Schema({
//     _id: Schema.Types.ObjectId,
//     primary_id: String,
//     secondary_id: String,
//     user: String,
//     profilePic: String,
//     time: String,
//     text: String
// });

const CommentSchema = new Schema({
    _id: Schema.Types.ObjectId,
    primary_id: String,
    secondary_id: String,
    group_comments: {type: Array, default: []}
});

module.exports = mongoose.model('Comment', commentSchema, 'news_stories');