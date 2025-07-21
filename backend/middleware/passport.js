const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UsersModel = require('../model/UsersModel');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Upsert user
    const user = await UsersModel.findOneAndUpdate(
      { googleId: profile.id },
      {
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        photo: profile.photos[0]?.value,
        // Do not update role here; default is 'user'.
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Serialize/deserialize (not used with JWT, but required by passport)
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UsersModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport; 