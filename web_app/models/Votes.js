const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const voteSchema = new Schema({
    _id: Schema.Types.ObjectId,
    primary_id: String,
    secondary_id: String,
    left_votes: Number,
    right_votes: Number
});

module.exports = mongoose.model('Votes', voteSchema, 'votes');