import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "./database";
import { v4 as uuidv4 } from "uuid";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await db("users").where("google_id", profile.id).first();

        if (user) {
          // User exists, return the user
          return done(null, user);
        }

        // Check if user exists with the same email
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email found in Google profile"), false);
        }

        const existingUser = await db("users").where("email", email).first();

        if (existingUser) {
          // User exists with email but different auth provider
          if (existingUser.auth_provider === "local") {
            // Link the Google account to existing local account
            await db("users").where("id", existingUser.id).update({
              google_id: profile.id,
              updated_at: new Date(),
            });

            return done(null, existingUser);
          } else {
            // Google user already exists but with different google_id (shouldn't happen)
            return done(
              new Error("Account already exists with different provider"),
              false
            );
          }
        }

        // Create new user with Google OAuth
        const userId = uuidv4();
        const username = profile.displayName || email.split("@")[0];

        // Create user
        await db("users").insert({
          id: userId,
          email,
          username,
          password: null, // No password for Google users
          auth_provider: "google",
          google_id: profile.id,
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Create profile
        await db("profiles").insert({
          id: uuidv4(),
          user_id: userId,
          display_name: profile.displayName || username,
          avatar_url: profile.photos?.[0]?.value || null,
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Get the created user
        user = await db("users").where("id", userId).first();
        return done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await db("users").where("id", id).first();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
