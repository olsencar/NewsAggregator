const mongoose = require('mongoose'); 
const User = mongoose.model('User');

module.exports = (app) => {
    /*
        Get the user's upvotes 
    */
    app.get('/api/user/:user/upvotes', (req, res) => {
        
    });

    /*
        Get the user's comments
    */
   app.get('/api/user/:user/comments', (req, res) => {

   });
}