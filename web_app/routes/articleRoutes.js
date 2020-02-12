const mongoose = require('mongoose'); 
const Article = mongoose.model('Article');
const Comment = mongoose.model('Comment');

biasIsOppositeSign = (bias1, bias2) => {
    return ((bias1 ^ bias2) < 0);
}

getMostSimilarArticle = (article) => {
    const similarArticles = article.similar_articles;
    let chosenArticle = similarArticles[0];
    for (let i = 0; i < similarArticles.length; i++) {
        if (biasIsOppositeSign(similarArticles[i].bias, article.bias)) {
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
        let s_primary_id = req.params.pid;
        let s_secondary_id = req.params.sid;
        await Comment.findOne({ $or:[{ primary_id: s_primary_id, secondary_id: s_secondary_id}, { primary_id: s_secondary_id, secondary_id: s_primary_id}]}, function(err, comment){  
            if (err) { //comment not found
                console.log("Error locating document");
            }
            if(comment){
                //success
                return res.status(200).send(comment);
            }
            return res.status(200).send(null);
        });
    });
    //add comment to db
    app.post('/api/comments/add', async (comment_data, res) => {
        //search_primary_key and search_secondary_key
        let s_primary_id = comment_data.body.primary_id;
        let s_secondary_id = comment_data.body.secondary_id;
        let new_comment = comment_data.body.group_comments[0]
        const filter = {primary_id: s_primary_id, secondary_id: s_secondary_id};
        const update = { $push: { group_comments: new_comment } };
        let doc = await Comment.findOneAndUpdate(filter, update, {
            new: true,
            upsert: true, // Make this update into an upsert
            useFindAndModify: false
        });
        return res.status(200).send(doc);
    });

    app.get('/api/articles/recent', async (req, res) => {
        let beginDate = new Date();
        beginDate.setDate(beginDate.getDate() - 7);
        try {
            let articles = await Article.find({
                publish_date: {$gt: beginDate}
            }).sort({'publish_date': -1}).lean();

            articles.forEach((article) => {
                article.most_similar_article = getMostSimilarArticle(article);
            });
            articles = articles.filter((doc) => (doc.most_similar_article.bias !== doc.bias && doc.most_similar_article.similarity_score > .28));

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