// Gets the Required poackages
require('dotenv').config({ path: require('find-config')('.env') });
const TwitterPackage = require('twitter');
const node = require('node-essentials');
const fs = require('fs')
const path = require('path');
const parse = require('querystring').parse;
const http = require('http');
const Filter = require('bad-words'),
filter = new Filter();
const Jimp = require("jimp");

const {instagram} = require('./instagram');
const blacklist = process.env.BLACKLIST.split(",");

// Api Keys
const config = {
    twitter: {
        track: "#HaloSpotlight",
        secret: {
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            access_token_key: process.env.TWITTER_ACESS_TOKEN_KEY,
            access_token_secret: process.env.TWITTER_ACESS_TOKEN_SECRET
        }
    }
}

let errorNumber = 0;

function twitter(){

    const Twitter = new TwitterPackage(config.twitter.secret);

    Twitter.stream('statuses/filter', { track: config.twitter.track }, (stream) => {
        stream.on('data', (tweet) => {

            var retweetId = tweet.id_str;
            // console.log(tweet);   
            // writeError(tweet, "Tweet")     

            // let statusObj = {in_reply_to_status_id: tweet.id_str,  status: "@" + tweet.user.screen_name +"\n" + message };
            if(!tweet.hasOwnProperty('retweeted_status')){
                if(eligible(tweet)){
                    Twitter.post(`statuses/retweet/${retweetId}`,  function(error, response){
                        if(response){ 
                            // console.log(response)
                            Twitter.post('favorites/create', {id: retweetId}, function(err, response){
                                if(response){ 
                                    console.log("Success")
                                }
                                if(err){ 
                                    writeError(err, "Like")
                                }
                            });
                        }
                        if(error){ 
                            writeError(error, "Retweet")
                        }
                    });
                    downloadMedia(tweet);
                }
            }
        });

        stream.on('error', function(error) {
            writeError(error, "Stream")
        });
    });
}

function writeError(error, area){
    console.log(error);
    errorNumber += 1;
    node.writeToFile("./logs", `${area}_Error_${errorNumber}`, "txt", JSON.stringify(error));
}

function eligible(tweet) {
    const isQuoteTweet = tweet.is_quote_status;
    const isNotProfane = !filter.isProfane(tweet.text);
    const isNotLink = tweet.entities.urls.length === 0 ? true : false;
    const isSensitive = tweet.possibly_sensitive;

    if(!isQuoteTweet && isNotProfane && isNotLink && !isSensitive){
        return true;
    }
    else {
        return false;
    }
}

function downloadMedia(tweet) {
    const photos = tweet.entities && tweet.entities.media;
    if (photos) {
        if (photos[0].type === 'photo') {
            fetch(photos[0].media_url, tweet)
        }
    }
}

const fetch = (url, tweet) => {
    const ext = path.extname(url);
    let image = path.join(__dirname, 'images', `photo${ext}`);
    console.log(url, image);
    const writer = fs.createWriteStream(image);
    writer.on('end', () => {
        // callback();
    });
    http.get(require('url').parse(url), (res) => {
        res.pipe(writer);
        // if(ext === ".png"){
        //     Jimp.read(image, (err, image) => {
        //         if (err) {
        //             console.log(err);
        //         } else {
        //             image.write(path.join(__dirname, 'images', `photo.jpg`))
        //         }
        //     })
        //     image = path.join(__dirname, 'images', `photo${ext}`);
        // }
        if(ext === ".jpg"){
            if(!blacklist.includes(tweet.user.screen_name)){
                instagram(image, tweet);
            }
        }
    });
};

twitter();