const mongoose = require('mongoose'); 
const Article = mongoose.model('Article');
const SIMILARITY_SCORE_MIN = 0.68;

biasIsOppositeSign = (bias1, bias2) => {
    return ((bias1 ^ bias2) < 0);
}

getMostSimilarArticle = (article) => {
    if (article.hasOwnProperty('similar_articles')) {
        const similarArticles = article.similar_articles;
        let chosenArticle = null;
        for (let i = 0; i < similarArticles.length; i++) {
            if (biasIsOppositeSign(similarArticles[i].bias, article.bias)) {
                chosenArticle = similarArticles[i];
                break;
            }
        }
        return chosenArticle;
    }
    return null;
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
            articles = articles.filter((doc) => (doc.most_similar_article && doc.most_similar_article.similarity_score > SIMILARITY_SCORE_MIN));

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

    app.get('/api/articles/search', async (req, res) => {
        let searchTerm = req.query.q;

        try {
            let articles = await Article.aggregate([
                {
                    $searchBeta: {
                        "search": {
                            query: searchTerm,
                            path: ['description', 'title']
                        }
                    }
                },
                {
                    $limit: 50
                },
                {
                    $sort: {
                        "publish_date": -1
                    }
                }
            ]);

            articles.forEach((article) => {
                article.most_similar_article = getMostSimilarArticle(article);
            });
            articles = articles.filter((doc) => (doc.most_similar_article && doc.most_similar_article.similarity_score > SIMILARITY_SCORE_MIN));
            
            return res.status(200).send(articles);
        } catch (error) {
            console.error("Internal server error when querying MongoDB.")
            console.error(error);
            return res.status(500).send();
        }
    });
}