import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import env from './env.js';

import User from '../models/user.model.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const avatar = profile.photos?.[0]?.value || '';

        let user = await User.findOne({ googleId: profile.id });

        if (!user && email) {
          user = await User.findOne({ email });

          if (user) {
            user.googleId = profile.id;
            if (avatar && !user.avatar) {
              user.avatar = avatar;
            }
            if (profile.displayName && !user.name) {
              user.name = profile.displayName;
            }

            await user.save();
            return done(null, user);
          }
        }

        if (user) {
          return done(null, user);
        }

        user = new User({
          name: profile.displayName,
          email,
          googleId: profile.id,
          avatar,
          role: 'customer',
        });

        await user.save();
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;