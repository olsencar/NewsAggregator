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
        let s_primary_id = req.params.pid;
        let s_secondary_id = req.params.sid;
        await Comment.findOne({ $or:[{ primary_id: s_primary_id, secondary_id: s_secondary_id}, { primary_id: s_secondary_id, secondary_id: s_primary_id}]}, function(err, comment){  
            if (err) { //comment not found
                console.log("Error locating document");
            }
            if(comment){
                //success
                console.log("success");
                console.log(comment);
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

        //////////////////////////////////////////////////////////////////////////////////////
        //using upsert
        let new_comment = comment_data.body.group_comments[0]

        //READ THIS NOTE: 
        // I need the filter below to be an OR statement like this:
        // { $or:[{ primary_id: s_primary_id, secondary_id: s_secondary_id}, { primary_id: s_secondary_id, secondary_id: s_primary_id}]}
        // to find comment documents even if the articles are in different order/structuring
        // it looks like if upsert (findOneandUpdate) doesnt find a document, it constructs one using the 'filter' + 'update'
        // BUT if you try to use the filter above with the OR like I was talking about it just doesnt use it in the construction of the new doc (= new doc wont have the)
        // primary_id and secondary_id fields... so right now I have just hard coded the filter to always assume correct document id ordering when looking in the db.

        const filter = {primary_id: s_primary_id, secondary_id: s_secondary_id};
        const update = { $push: { group_comments: new_comment } };
        let doc = await Comment.findOneAndUpdate(filter, update, {
            new: true,
            upsert: true, // Make this update into an upsert
            useFindAndModify: false
        });
        return res.status(200).send(doc);
        //////////////////////////////////////////////////////////////////////////////////////
        
        //const comment_group = await Comment.findOne({ $or:[{ primary_id: s_primary_id, secondary_id: s_secondary_id}, { primary_id: s_secondary_id, secondary_id: s_primary_id}]}); 
        //console.log(comment_group);
        // if (!comment_group) { //comment not found -> create new doc with this comment
        //     console.log("creating entirely new comment group document");
        //     console.log(comment_data.body);
        //     // creating new document
        //     // const singelton = new Comment(comment_data.body);
        //     // await singelton.save(function(err) {
        //     //     if (err) { return res.status(500).send(); }
        //     //     next();
        //     // });
        //     await Comment.create(comment_data.body, function (err, doc) {
        //         if(err){
        //             console.log("Failed to create new comment_group document for first comment in article group");
        //             return res.status(500).send();
        //         }
        //         else{
        //             console.log("Successfully inserted comment");
        //             return res.status(200).send(doc);
        //         }
        //     });
        // }
        // else{
        //     //update and save the comment_group document with the newest comment appended to its array
        //     comment_group.group_comments.push(comment_data.body.group_comments[0]); //note: the comment data is passed in in the
        //                                                                     //form of a mongo comment document to make this and 'create' code easier                                      
        //     await comment_group.save(function(err) {
        //         if (err) { return res.status(500).send(); }
        //         next();
        //     });
        //     //success
        //     console.log("1. Succesfully inserted comment");
        //     return res.status(200).send();
        // }
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