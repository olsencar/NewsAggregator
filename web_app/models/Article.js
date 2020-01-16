const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    description: String,
    source_name: String,
    images: [String],
    similar_articles: [String],
    category: String,
    rss_link: String,
    orig_link: String,
    publish_date: { type: Date },
    bias: Number
});

mongoose.model('Article', articleSchema, 'news_stories');