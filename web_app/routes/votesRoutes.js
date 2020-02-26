const mongoose = require('mongoose'); 
const Votes = mongoose.model('Votes');

module.exports = (app) => {
    //finding votes for an article group
    app.get('/api/votes/byId/:pid-:sid', async (req, res) => {
        let s_primary_id = req.params.pid;
        let s_secondary_id = req.params.sid;
        await Votes.findOne({ $or:[{ primary_id: s_primary_id, secondary_id: s_secondary_id}, { primary_id: s_secondary_id, secondary_id: s_primary_id}]}, function(err, votes){  
            if (err) { //votes not found (still 0-0)
                console.log("No votes found");
            }
            if(votes){
                //success
                return res.status(200).send(votes);
            }
            return res.status(200).send(null);
        });
    });

    //add upvote
    app.post('/api/votes/upvote', async (votes_data, res) => {
        //search_primary_key and search_secondary_key
        let s_primary_id = votes_data.body.pid;
        let s_secondary_id = votes_data.body.sid;
        const filter = {primary_id: s_primary_id, secondary_id: s_secondary_id};
        const update = {primary_id: s_primary_id, 
                        secondary_id: s_secondary_id,
                        left_votes: votes_data.body.left_votes,
                        right_votes: votes_data.body.right_votes  
                        };
        let doc = await Votes.findOneAndUpdate(filter, update, {
            new: true,
            upsert: true, // Make this update into an upsert
            useFindAndModify: false
        });
        return res.status(200).send(doc);
    });
}