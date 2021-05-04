// Gets the Required poackages
require('dotenv').config({ path: require('find-config')('.env') });
const TwitterPackage = require('twitter');
const node = require('node-essentials');
const fs = require('fs')
const path = require('path');
const http = require('http');
const https = require('https');
const Filter = require('bad-words'),
filter = new Filter();
const Jimp = require("jimp");

const {instagram, instagramVideo} = require('./instagram');
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
            // console.log(tweet.id_str);   
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
    const photo = tweet.entities && tweet.entities.media;
    const video = tweet.extended_entities && tweet.extended_entities.media;

    if (photo) {
        if (photo[0].type === 'photo' && video[0].type === 'photo') {
            fetch(photo[0].media_url, tweet)
        }
        else if(video[0].type === 'video'){
            const lenght = video[0].video_info.variants.length - 1;
            const link = video[0].video_info.variants[lenght].url;
            const cover = video[0].media_url;
            fetchVideo(link, tweet, cover)
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

const fetchVideo = (url, tweet, cover) => {
    const ext = path.extname(url).split("?")[0];
    let video = path.join(__dirname, 'videos', `video${ext}`);
    console.log(url, video);
    const writer = fs.createWriteStream(video);
    writer.on('end', () => {
        // callback();
    });
    https.get(require('url').parse(url), (res) => {
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
        if(ext === ".mp4"){
            if(!blacklist.includes(tweet.user.screen_name)){
                instagramVideo(video, tweet, cover);
            }
        }
    });
};

// twitter();
downloadMedia({
    "created_at": "Mon May 03 15:38:04 +0000 2021",
    "id": 1389242863851131000,
    "id_str": "1389242863851130888",
    "text": "#HaloSpotlight https://t.co/972oejDGa0",
    "display_text_range": [
        0,
        14
    ],
    "source": "<a href=\"https://mobile.twitter.com\" rel=\"nofollow\">Twitter Web App</a>",
    "truncated": false,
    "in_reply_to_status_id": null,
    "in_reply_to_status_id_str": null,
    "in_reply_to_user_id": null,
    "in_reply_to_user_id_str": null,
    "in_reply_to_screen_name": null,
    "user": {
        "id": 838721311480377300,
        "id_str": "838721311480377344",
        "name": "Neeko",
        "screen_name": "Neeko_Senpai",
        "location": "Inside your Waifu.",
        "url": null,
        "description": "Above heaven, under heaven, I alone am worthy of honor.",
        "translator_type": "none",
        "protected": false,
        "verified": false,
        "followers_count": 9,
        "friends_count": 9,
        "listed_count": 0,
        "favourites_count": 6,
        "statuses_count": 28,
        "created_at": "Mon Mar 06 12:01:58 +0000 2017",
        "utc_offset": null,
        "time_zone": null,
        "geo_enabled": false,
        "lang": null,
        "contributors_enabled": false,
        "is_translator": false,
        "profile_background_color": "000000",
        "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
        "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
        "profile_background_tile": false,
        "profile_link_color": "ABB8C2",
        "profile_sidebar_border_color": "000000",
        "profile_sidebar_fill_color": "000000",
        "profile_text_color": "000000",
        "profile_use_background_image": false,
        "profile_image_url": "http://pbs.twimg.com/profile_images/1219972627583983617/nK5Sv7n7_normal.jpg",
        "profile_image_url_https": "https://pbs.twimg.com/profile_images/1219972627583983617/nK5Sv7n7_normal.jpg",
        "profile_banner_url": "https://pbs.twimg.com/profile_banners/838721311480377344/1579699117",
        "default_profile": false,
        "default_profile_image": false,
        "following": null,
        "follow_request_sent": null,
        "notifications": null,
        "withheld_in_countries": []
    },
    "geo": null,
    "coordinates": null,
    "place": null,
    "contributors": null,
    "is_quote_status": false,
    "quote_count": 0,
    "reply_count": 0,
    "retweet_count": 0,
    "favorite_count": 0,
    "entities": {
        "hashtags": [
            {
                "text": "HaloSpotlight",
                "indices": [
                    0,
                    14
                ]
            }
        ],
        "urls": [],
        "user_mentions": [],
        "symbols": [],
        "media": [
            {
                "id": 1389242545490862000,
                "id_str": "1389242545490862083",
                "indices": [
                    15,
                    38
                ],
                "additional_media_info": {
                    "monetizable": false
                },
                "media_url": "http://pbs.twimg.com/ext_tw_video_thumb/1389242545490862083/pu/img/_eSYcC0wqgHwZY8_.jpg",
                "media_url_https": "https://pbs.twimg.com/ext_tw_video_thumb/1389242545490862083/pu/img/_eSYcC0wqgHwZY8_.jpg",
                "url": "https://t.co/972oejDGa0",
                "display_url": "pic.twitter.com/972oejDGa0",
                "expanded_url": "https://twitter.com/Neeko_Senpai/status/1389242863851130888/video/1",
                "type": "photo",
                "sizes": {
                    "thumb": {
                        "w": 150,
                        "h": 150,
                        "resize": "crop"
                    },
                    "medium": {
                        "w": 1200,
                        "h": 675,
                        "resize": "fit"
                    },
                    "small": {
                        "w": 680,
                        "h": 383,
                        "resize": "fit"
                    },
                    "large": {
                        "w": 1280,
                        "h": 720,
                        "resize": "fit"
                    }
                }
            }
        ]
    },
    "extended_entities": {
        "media": [
            {
                "id": 1389242545490862000,
                "id_str": "1389242545490862083",
                "indices": [
                    15,
                    38
                ],
                "additional_media_info": {
                    "monetizable": false
                },
                "media_url": "http://pbs.twimg.com/ext_tw_video_thumb/1389242545490862083/pu/img/_eSYcC0wqgHwZY8_.jpg",
                "media_url_https": "https://pbs.twimg.com/ext_tw_video_thumb/1389242545490862083/pu/img/_eSYcC0wqgHwZY8_.jpg",
                "url": "https://t.co/972oejDGa0",
                "display_url": "pic.twitter.com/972oejDGa0",
                "expanded_url": "https://twitter.com/Neeko_Senpai/status/1389242863851130888/video/1",
                "type": "video",
                "video_info": {
                    "aspect_ratio": [
                        16,
                        9
                    ],
                    "duration_millis": 69550,
                    "variants": [
                        {
                            "bitrate": 256000,
                            "content_type": "video/mp4",
                            "url": "https://video.twimg.com/ext_tw_video/1389242545490862083/pu/vid/480x270/6a2EDmBsgkn5rjTo.mp4?tag=12"
                        },
                        {
                            "bitrate": 832000,
                            "content_type": "video/mp4",
                            "url": "https://video.twimg.com/ext_tw_video/1389242545490862083/pu/vid/640x360/S_H2aCYNluRd4x_Z.mp4?tag=12"
                        },
                        {
                            "content_type": "application/x-mpegURL",
                            "url": "https://video.twimg.com/ext_tw_video/1389242545490862083/pu/pl/3uyWIhsSkGKHoVIl.m3u8?tag=12&container=fmp4"
                        },
                        {
                            "bitrate": 2176000,
                            "content_type": "video/mp4",
                            "url": "https://video.twimg.com/ext_tw_video/1389242545490862083/pu/vid/1280x720/D9ckZABjzpm1eJoH.mp4?tag=12"
                        }
                    ]
                },
                "sizes": {
                    "thumb": {
                        "w": 150,
                        "h": 150,
                        "resize": "crop"
                    },
                    "medium": {
                        "w": 1200,
                        "h": 675,
                        "resize": "fit"
                    },
                    "small": {
                        "w": 680,
                        "h": 383,
                        "resize": "fit"
                    },
                    "large": {
                        "w": 1280,
                        "h": 720,
                        "resize": "fit"
                    }
                }
            }
        ]
    },
    "favorited": false,
    "retweeted": false,
    "possibly_sensitive": false,
    "filter_level": "low",
    "lang": "und",
    "timestamp_ms": "1620056284283"
})