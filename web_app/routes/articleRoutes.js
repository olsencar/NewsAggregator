const mongoose = require('mongoose'); 
const Article = mongoose.model('Article');
const Comment = mongoose.model('Comment');

getMostSimilarArticle = (article) => {
    const similarArticles = article.similar_articles;
    let chosenArticle = similarArticles[0];
    for (let i = 0; i < similarArticles.length; i++) {
        if (similarArticles[i].bias !== article.bias) {
            chosenArticle = similarArticles[i];
            break;
        }
    }
    return chosenArticle;
}

module.exports = (app) => {
    app.get('/api/articles/byId/:id', async (req, res) => {
        const id = req.params.id;
        try {
            let article = await Article.findById(id);
         
            if (article == null) return res.status(404).send(`No article found for id ${id}`);
            return res.status(200).send(article);
        } catch (error) {
            console.error(error);
            return res.status(500).send();
        }
    });
    //finding comments for an article group
    app.get('/api/comments/byId/:pid-:sid', async (req, res) => {
        let primary_id = req.params.pid;
        let secondary_id = req.params.sid;
        try {
            let comments = await Comment.find.or([{ primary_id: primary_id, secondary_id: secondary_id}, { primary_id: secondary_id, secondary_id: primary_id}]);         
            if (comments == null) return res.status(404).send(`No article found for article group`);
            return res.status(200).send(comments);
        } catch (error) {
            console.error(error);
            return res.status(500).send();
        }
    });
    //add comment to db
    app.get('/api/comments/add/:pid-:sid', async (req, res) => {
        let primary_id = req.params.pid;
        let secondary_id = req.params.sid;
        let comments = await Comment.findOne({ $or:[{ primary_id: primary_id, secondary_id: secondary_id}, { primary_id: secondary_id, secondary_id: primary_id}]}, function(err, comment_group){  
            if (err) { //create new doc and add this comment

            }
            comment_group.group_comments.push();
            comment_group.save(function(err) {
                if (err) { return next(err); }
            });
        });
    app.get('/api/articles/recent', async (req, res) => {
        let beginDate = new Date();
        beginDate.setDate(beginDate.getDate() - 7);
        try {
            let articles = await Article.find({
                publish_date: {$gt: beginDate}
            }).lean();

            articles.forEach((article) => {
                article.most_similar_article = getMostSimilarArticle(article);
            });
            articles = articles.filter((doc) => (doc.most_similar_article.bias !== doc.bias && doc.most_similar_article.similarity_score > .20));

            return res.status(200).send(articles);
        } catch (error) {
            console.error(error);
            return res.status(500).send(error);
        }
    });

    app.get('/api/articles/find', async (req, res) => {
        let title = req.query.title;
        let description = req.query.description;
        let source_name = req.query.source_name;
        let searchFor = {}

        if (title) searchFor['title'] = decodeURIComponent(title);
        if (description) searchFor['description'] = decodeURIComponent(description); 
        if (source_name) searchFor['source_name'] = decodeURIComponent(source_name); 

        if (searchFor === {}) {
            console.log("No query parameters given");
            return res.status(404).send("No query parameters given");
        }

        try {
            let article = await Article.findOne(searchFor);    
                
            if (article == undefined) return res.status(404).send(`No article found for \n\ttitle: ${title}\n\tdescription: ${description}\n\tsource_name: ${source_name}`);
            return res.status(200).send(article);
        } catch (error) {
            console.error("Internal server error when querying MongoDB.")
            console.error(error);
            return res.status(500).send();
        }
    });
}