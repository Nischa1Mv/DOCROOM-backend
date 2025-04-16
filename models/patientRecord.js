// Patient Record Schema
import mongoose from 'mongoose';

const patientRecordSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timeStampBegin: { type: Date, required: true },
    timestampEnd: { type: Date },
    BotSummary: {
        reportedSymptoms: String,
        aiAnalysis: String,
        patientApproachMessage: String,
        priorityStatus: { type: String, enum: ['high', 'medium', 'low'] },
        aiSummary: String,
        AIDiagnosis: String,
    },
    DoctorResponse: String,
    isClosed: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('PatientRecord', patientRecordSchema);
