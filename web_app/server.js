const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require ('body-parser');
const dbConfig = require('./config/config');

// Import the DB Models
require('./models/Article');

const app = express();

mongoose.Promise = global.Promise;

mongoose.connect(`mongodb+srv://${dbConfig.readOnly.user}:${dbConfig.readOnly.password}@newsaggregator-0ys1l.mongodb.net/NewsAggregator?retryWrites=true&w=majority`);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', () => {
    console.log('Connection open to MongoDB.');
});


app.use(bodyParser.json());

// Import routes
require('./routes/articleRoutes')(app);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));

    const path = require('path');
    app.get('*', (req, res) => {
        console.log('any path');
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Running server on port ${PORT}`);
});