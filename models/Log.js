const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    src_ip: { type: String, required: true },
    dest_ip: { type: String, required: true },
    timestamp: { type: String, required: true },
    protocol: { type: String, required: true },
    length: { type: String, required: true },
    info: { type: String }
});

const Log = mongoose.model('Log', logSchema);
module.exports = Log;

