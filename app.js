import express from "express";
import cors from "cors";
import passport from "passport";
import 'dotenv/config';
import authRoute from "./routes/authRoute.js";
import PatientRecord from "./routes/patientRecord.js";
import createPatient from "./routes/createPatient.js";
import botSummary from "./routes/botSummary.js";
import doctorResponse from "./routes/doctorResponse.js"



const app = express();

// Middleware for parsing request body
app.use(express.json());

// CORS Configuration for deployment


//localhost
app.use(cors());

app.use(passport.initialize());

var opts = {}

app.get('/', function (req, res) {
    z
    res.send({
        message: "working"
    });
});

app.use('/auth', authRoute);
app.use('/patientRecord', PatientRecord)
app.use('/createPatient', createPatient);
app.use('/botSummary', botSummary);
app.use('/doctorResponse', doctorResponse);


export default app;