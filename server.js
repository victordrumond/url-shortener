// Require dependencies & basic configuration
const express = require('express');
const mongoose = require('mongoose');
const generateUniqueId = require('generate-unique-id');
require('dotenv').config();
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// MongoDB & Mongoose: connect to the database
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Set Mongoose schema & model
const urlShortenerSchema = new mongoose.Schema({
    original: String,
    shortened: String
});
const urlShortenerModel = mongoose.model("URL", urlShortenerSchema);

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.set('view engine', 'ejs');
app.get('/', async (req, res) => {
    const result = await urlShortenerModel.find({ original: req.query.url });
    return res.render('index', { found: result });
});

// POST requests: shorten URL
app.post('/shorturl', async (req, res) => {
    const findOnDatabase = await urlShortenerModel.find({ original: req.body.originalURL });
    if (!findOnDatabase) {
        return res.sendStatus(404);
    } else if (findOnDatabase.length === 0) {
        const saveOnDatabase = await urlShortenerModel.create({ 
            original: req.body.originalURL,
            shortened: generateUniqueId({ length: 6, useLetters: true, useNumbers: true})
        });
        if (saveOnDatabase) {
            return res.redirect('/?url=' + saveOnDatabase.original);
        } else {
            return res.json("An error occurred. Please try again.");
        };
    } else {
        return res.redirect('/?url=' + findOnDatabase[0].original);
    };
});

// Get requests: receive shortened URL
app.get('/:shortened', async (req, res) => {
    const result = await urlShortenerModel.findOne({ shortened: req.params.shortened });
    if (!result) {
        return res.sendStatus(404);
    } else {
        return res.redirect(result.original);
    };
});

// Listen connection on port
app.listen(port, () => {
    console.log('Your app is listening on port ' + port);
});