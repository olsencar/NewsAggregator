const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = (app) => {
    /*
        Get the user's item 
    */
    app.get('/api/user/:user', async (req, res) => {
        const uid = req.params.user;
        try {
            const user = await User.findOne({
                uid: uid
            });
            return res.status(200).send(user);
        } catch (err) {
            return res.status(404).send(err);
        }

    });

    /*
         Add a comment for the user
    */
    app.post('/api/user/:user/addComment', async (req, res) => {
        const uid = req.params.user;
        if (!req.body.data) {
            return res.status(404).send('No data object in the body.');
        }
        try {
            await User.updateOne(
                {
                    uid: uid
                },
                {
                    $push: {
                        comments: {
                            $each: [req.body.data],
                            $position: 0
                        }
                    }
                },
                {
                    upsert: true
                }
            );
            return res.status(200).send('Added Comment');
        } catch (err) {
            console.log(err);
            return res.status(404).send(err);
        }
    });

    /*
      Add an upvote for the user
    */
    app.post('/api/user/:user/upvote', async (req, res) => {
        const uid = req.params.user;
        if (!req.body.data) {
            return res.status(404).send('No data object in the body.');
        }

        const data = req.body.data;

        try {
            let response;
            response = await User.updateOne(
                {
                    uid: uid,
                    'upvotes.primary_id': data.primary_id,
                    'upvotes.secondary_id': data.secondary_id
                },
                {
                    $set: {
                        'upvotes.$.voteDirection': data.voteDirection
                    }
                }
            );

            if (!response.n || response.n === 0) {
                response = await User.updateOne(
                    {
                        uid: uid
                    },
                    {
                        $push: {
                            upvotes: data
                        }
                    },
                    {
                        upsert: true
                    }
                );
            }

            return res.status(200).send('Successful operation');
        } catch (err) {
            console.log(err);
            return res.status(404).send(err);
        }
    });
}