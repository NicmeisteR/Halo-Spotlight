// Gets the Required poackages
require('dotenv').config({ path: require('find-config')('.env') });
const TwitterPackage = require('twitter');

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

            // console.log(tweet.text);
            var retweetId = tweet.id_str;
            // console.log(tweet);

            // let statusObj = {in_reply_to_status_id: tweet.id_str,  status: "@" + tweet.user.screen_name +"\n" + message };
            if(!tweet.hasOwnProperty('retweeted_status')){
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
            }
        });

        stream.on('error', function(error) {
            writeError(error, "Stream")
        });
    });
}

function writeError(error, area){
    errorNumber += 1;
    node.writeToFile("./logs", `${area}_Error_${errorNumber}`, "txt", error);
}

twitter();