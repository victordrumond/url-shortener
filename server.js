// Require dependencies
const express = require('express');
const mongoose = require('mongoose');
const shortId = require('shortid');
require('dotenv').config();

// Basic configuration
const app = express();
const port = process.env.PORT || 3000;

// MongoDB & Mongoose: connect to the database
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Set Mongoose schema & model
const urlShortenerSchema = new mongoose.Schema({
    original: {
        type: String,
        required: true
    },
    shortened: {
        type: String,
        required: true,
        default: shortId.generate
    }
});
const urlShortenerModel = mongoose.model("URL", urlShortenerSchema);

// Set view engine to EJS
app.set('view engine', 'ejs');

// Set Urlencoded
app.use(express.urlencoded({ extended: false }));

// Basic routing
app.get('/', async (req, res) => {
    const result = await urlShortenerModel.find({ original: req.query.url });
    res.render('index', { found: result });
});

// POST requests
app.post('/shorturl', (req, res) => {
    urlShortenerModel.find({ original: req.body.originalURL }, (err, docs) => {
        if (err) {
            console.log(err);
        } else {
            if (docs.length === 0) {
                urlShortenerModel.create({ original: req.body.originalURL });
            };
            res.redirect('/?url=' + req.body.originalURL);
        };
    });
});

// Get requests
app.get('/:shortened', async (req, res) => {
    const result = await urlShortenerModel.findOne({ shortened: req.params.shortened });
    if (result === null) return res.sendStatus(404);
    res.redirect(result.original);
});

// Listen connection on port
app.listen(port, () => {
    console.log('Your app is listening on port ' + port);
});