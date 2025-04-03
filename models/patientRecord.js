// Patient Record Schema
import mongoose from 'mongoose';

const patientRecordSchema = new mongoose.Schema({
    
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    timeStampBegin: { type: Date, default: Date.now },
    BOT: {
        reportedSymptoms: String,
        aiAnalysis: String,
        patientApproachMessage: String,
        priorityStatus: { type: String, enum: ['high', 'medium', 'low'] },
        aiSummary: String,
        AIDiagnosis: String,
    },
    isClosed: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('PatientRecord', patientRecordSchema);
