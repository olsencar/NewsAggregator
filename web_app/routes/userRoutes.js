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
            console.log(user);
            return res.status(200).send(user);
        } catch (err) {
            return res.status(404).send(err);
        }

    });

   /*
        Add a comment for the user
   */
  app.post('/api/user/:user/addComment', async (req, res) => {
      console.log(req.body);
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
    console.log(req.body);
    const uid = req.params.user;
    if (!req.body.data) {
        return res.status(404).send('No data object in the body.');
    }

    const data = req.body.data;

    try {
        const response = await User.updateOne(
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

        console.log(response);

        if (response.n === 0) {
            await User.updateOne(
                {
                    uid: uid
                }, 
                {
                    $push: {
                        upvotes: {
                            $each: [data],
                            $position: 0
                        }
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