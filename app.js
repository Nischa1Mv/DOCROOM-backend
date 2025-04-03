import express from "express";
import cors from "cors";
import passport from "passport";
import 'dotenv/config';
// import todoRoute from "./routes/todoRoute.js";
import authRoute from "./routes/authRoute.js";
// import { Strategy as JwtStrategy } from 'passport-jwt';
// import { ExtractJwt } from 'passport-jwt';
// import { User } from "./models/userModel.js";


const app = express();

// Middleware for parsing request body
app.use(express.json());

// CORS Configuration for deployment


//localhost
app.use(cors());

app.use(passport.initialize());

var opts = {}

// opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// opts.secretOrKey = process.env.SECRET;

// passport.use(new JwtStrategy(opts, async function (jwt_payload, done) {
//     try {
//         const user = await User.findById(jwt_payload.id);
//         if (user) {
//             return done(null, user);
//         } else {
//             return done(null, false);
//         }
//     } catch (error) {
//         return done(error, false);
//     }
// }));

app.get('/', function (req, res) {
    res.send({
        message: "working"
    });
});

app.use('/auth', authRoute);
// app.use('/todo', todoRoute);

export default app;