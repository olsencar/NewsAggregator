const express = require('express');
const mongoose = require('mongoose');
const NodeCache = require('node-cache');
const bodyParser = require ('body-parser');
const dbConfig = require('./config/config');

const cache = new NodeCache();
// Import the DB Models
require('./models/Article').default;
require('./models/Comment').default;
require('./models/Votes').default;

const app = express();

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;

mongoose.connect(`mongodb+srv://${dbConfig.readWrite.user}:${dbConfig.readWrite.password}@newsaggregator-0ys1l.mongodb.net/NewsAggregator?retryWrites=true&w=majority`, {useNewUrlParser: true,  useUnifiedTopology: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', () => {
    console.log('Connection open to MongoDB.');
});

app.use(bodyParser.json());

// Import routes
require('./routes/articleRoutes')(app, cache);
require('./routes/commentRoutes')(app);
require('./routes/votesRoutes')(app);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));

    const path = require('path');
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Running server on port ${PORT}`);
});