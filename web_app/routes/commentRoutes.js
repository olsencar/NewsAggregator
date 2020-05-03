const mongoose = require('mongoose'); 
const Comment = mongoose.model('Comment');

module.exports = (app) => {
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
        const commentTime = Date.now();
        comment_data.body.group_comments[0].time = Date.now();
        //search_primary_key and search_secondary_key
        let s_primary_id = comment_data.body.primary_id;
        let s_secondary_id = comment_data.body.secondary_id;
        let new_comment = comment_data.body.group_comments[0];
        const filter = {primary_id: s_primary_id, secondary_id: s_secondary_id};
        const update = { $push: { group_comments: new_comment } };
        let doc = await Comment.findOneAndUpdate(filter, update, {
            new: true,
            upsert: true, // Make this update into an upsert
            useFindAndModify: false
        });
        return res.status(200).json({commentTime});
    });
}