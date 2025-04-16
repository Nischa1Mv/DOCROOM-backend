// Patient Record Schema
import mongoose from 'mongoose';

const patientRecordSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timeStampBegin: { type: Date, required: true },
    timestampEnd: { type: Date },
    botSummary: {
        reportedSymptoms: { type: String },
        aiAnalysis: { type: String },
        patientApproachMessage: { type: String },
        priorityStatus: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'] },
        aiSummary: { type: String },
        aiDiagnosis: { type: String },
    },
    doctorResponse: { type: String },
    isClosed: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('PatientRecord', patientRecordSchema);
