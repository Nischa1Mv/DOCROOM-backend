import express from "express";
import cors from "cors";
import passport from "passport";
import 'dotenv/config';
import authRoute from "./routes/authRoute.js";
import PatientRecord from "./routes/patientRecord.js";
import createRecord from "./routes/createRecord.js";
import doctorResponse from "./routes/doctorResponse.js"
import patients from "./routes/patients.js"
import conversation from "./routes/conversation.js"
import patientSummary from "./routes/patientSummary.js"
import openChat from "./routes/openChat.js"
import docDetails from "./routes/docDetails.js"



const app = express();

// Middleware for parsing request body
app.use(express.json());

// CORS Configuration for deployment


//localhost
app.use(cors());

app.use(passport.initialize());

var opts = {}

app.get('/', function (_, res) {

    res.send({
        message: "working"
    });
});

app.use('/auth', authRoute);
app.use('/patientRecord', PatientRecord); // get the list of active patientRecords
app.use('/createRecord', createRecord); // create a new patientRecord
app.use('/doctorResponse', doctorResponse); // post the doctor response to the db
app.use('/patients', patients); // get the list of patients who interacted with the doctor
app.use("/conversation", conversation); // get conversation between particular doctor and patient
app.use("/patientSummary", patientSummary); // get summary of the patientRecord
app.use("/openChat", openChat); // get only the part of the conversation related to this record
app.use("/docDetails", docDetails); // post the doctor details


export default app;