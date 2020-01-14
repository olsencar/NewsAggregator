const mongoose = require('mongoose');
const {Schema} = mongoose;

const articleSchema = new Schema({
    _id: String,
    title: String,
    description: String,
    source_name: String,
    images: Array,
    similar_articles: Array,
    category: String,
    rss_link: String,
    orig_link: String,
    publish_date: Date,
    bias: Number
});

mongoose.model('articles', articleSchema);