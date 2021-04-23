/* tslint:disable:no-console */
require('dotenv').config({ path: require('find-config')('.env') });
const { IgApiClient } = require('instagram-private-api');
const { readFile } = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(readFile);

const ig = new IgApiClient();

async function login() {
  // basic login-procedure
  ig.state.generateDevice(process.env.INSTAGRAM_USERNAME);
  await ig.account.login(process.env.INSTAGRAM_USERNAME, process.env.INSTAGRAM_PASSWORD);
}

async function instagram(path, tweet){
  await login();

  const publishResult = await ig.publish.photo({
    // read the file into a Buffer
    file: await readFileAsync(path),
    caption: `${tweet.text}
    Photo and all credit goes to @${tweet.user.screen_name} on #Twitter at https://twitter.com/${tweet.user.screen_name}
    -
    -
    #haloCE #halo2 #halo3 #halowars #halo3odst#haloreach #haloCEA #halo4 #halomcc #halo2anniversary #halo5guardians #halowars2 #halo6 #haloinfinte #masterchief #john117 #gaming`,
    // optional
    //TODO: @nicmeister add try catch for usernames if they don't exist so the app doesnt crash
    // usertags: {
    //   in: [
    //     // tag the user 'instagram' @ (0.5 | 0.5)
    //     // await generateUsertagFromName('NicolaasDev', 0.5, 0.5),
    //     await generateUsertagFromName(tweet.user.screen_name, 0.4, 0.4),
    //   ],
    // },
  });

//   console.log(publishResult);
}

/**
 * Generate a usertag
 * @param name - the instagram-username
 * @param x - x coordinate (0..1)
 * @param y - y coordinate (0..1)
 */
async function generateUsertagFromName(name, x, y) {
  // constrain x and y to 0..1 (0 and 1 are not supported)
  x = clamp(x, 0.0001, 0.9999);
  y = clamp(y, 0.0001, 0.9999);
  // get the user_id (pk) for the name
  const { pk } = await ig.user.searchExact(name);
  return {
    user_id: pk,
    position: [x, y],
  };
}

/**
 * Constrain a value
 * @param value
 * @param min
 * @param max
 */
const clamp = (value, min, max) => Math.max(Math.min(value, max), min);

module.exports = { instagram }