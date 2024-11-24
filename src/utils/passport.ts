import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import dotenv from "dotenv";
import prisma from "../db"; // Import Prisma client
import { Role } from "@prisma/client"; // Import Role enum for type safety
import { Request } from "express";

dotenv.config();

// Extend the Request type to include query
interface OAuthRequest extends Request {
  query: {
    role?: string; // Role query parameter will be a string from the URL
    state?: string; // The state query parameter is optional
  };
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:8000/auth/google/callback",
      passReqToCallback: true,
    },
    async (
      req: OAuthRequest,
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: Express.User | false) => void
    ) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("Email is required from Google"), false);
        }

        // Debug logs for state and role
        console.log("Raw query state:", req.query.state);

        // Parse and validate the `state` parameter
        let role: Role = Role.PLAYER; // Default to PLAYER
        if (req.query.state) {
          try {
            const state = JSON.parse(req.query.state) as { role?: string };
            console.log("Parsed state:", state);

            if (
              state.role &&
              Object.values(Role).includes(state.role as Role)
            ) {
              role = state.role as Role; // Assign role if valid
            } else {
              console.warn(
                "Invalid or missing role in state. Defaulting to PLAYER."
              );
            }
          } catch (error) {
            console.error("Error parsing state parameter:", error);
          }
        }

        console.log("Final role assigned:", role);

        // Check if the user already exists
        let user = await prisma.user.findUnique({ where: { email } });

        // If the user doesn't exist, create one with the provided role
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName || "No Name",
              password: "", // Leave blank for OAuth users
              role,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("Error in Google OAuth callback:", error);
        return done(error, false);
      }
    }
  )
);

// Serialize and deserialize user for session handling
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user || false); // Ensure `false` is returned if no user is found
  } catch (error) {
    done(error, false);
  }
});

export default passport;
