const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
const app = express();

mongoose.connect('mongodb://localhost:27017/urlShortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("Failed to connect to MongoDB", err);
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
  try {
    const shortUrls = await ShortUrl.find();
    res.render('index', { shortUrls: shortUrls, currenttime: new Date() });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
 
});

app.post('/shortUrls', async (req, res) => {
  const { fullUrl, txt } = req.body;
  try {
    const shortUrl = await ShortUrl.create({ full: fullUrl, text: txt });
    console.log('Created short URL:', shortUrl);
    res.redirect('/');
  } catch (err) {
    console.error('Error creating short URL:', err);
    res.status(500).send('Error creating short URL');
  }
});


app.get('/:shortUrl', async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
    if (shortUrl == null) return res.sendStatus(404);

    shortUrl.clicks++;
    await shortUrl.save();

    res.redirect(shortUrl.full);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log('Server started on port 5000');
});
