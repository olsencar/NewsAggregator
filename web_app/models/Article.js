const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema({
    _id: Schema.Types.ObjectId,
    title: String,
    description: String,
    source_name: String,
    images: [String],
    similar_articles: {type: Array, default: []},
    category: String,
    rss_link: String,
    orig_link: String,
    publish_date: { type: Date },
    bias: Number
});

module.exports = mongoose.model('Article', articleSchema, 'news_stories');