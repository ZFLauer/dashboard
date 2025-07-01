const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    Desc: { type: String, required: true },
    timeStamp: { type: String, required: true },
    srcIP: { type: String, required: true },
    srcPort: { type: String, required: true },
    destIP: { type: String, required: true },
    destPort: { type: String, required: true },
    commProtocol: { type: String, required: true },
    ruleID: { type: String, required: true },
    ecuID: { type: String, required: true },
    IDSMID: { type: String, required: true },
    mac: { type: String, required: true, unique: true } // MAC ist einzigartig
});

const Alert = mongoose.model('Alert', alertSchema);
module.exports = Alert;

