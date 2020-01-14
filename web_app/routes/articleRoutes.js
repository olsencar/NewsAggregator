const mongoose = require('mongoose');
const Article = mongoose.model('articles');

module.exports = (app) => {
    app.get('/api/article/:id', async (req, res) => {
        const id = req.params.id;
        console.log(id);
        let article = await Article.findById(id);
        console.log(article);
        return res.status(200).send(article);
    });
}