const express = require('express');
const multer = require('multer');
const csv = require('fast-csv');
const fs = require('fs');
const sftpClient = require('ssh2-sftp-client');
const Alert = require('../models/Alert');
const Log = require('../models/Log');  // Log model to store parsed PCAP details

const path = require('path');
const { exec } = require('child_process');
const mongoose = require('mongoose');
const router = express.Router();

// SFTP-Setup
const sftp = new sftpClient();
const sftpConfig = {
    host: '192.168.1.10',
    port: '22',
    username: 'root',
    password: 'root'
};

// List to track downloaded files
let downloadedFiles = [];

// Route for fetching CSV and PCAP files via SFTP
router.post('/fetch-sftp', async (req, res) => {
    try {
        await sftp.connect(sftpConfig);
        const fileList = await sftp.list('/home/root/');
        const snortLogList = await sftp.list('/var/log/snort/');

        const alertFiles = fileList.filter(file => file.name.startsWith('alert') && file.name.endsWith('.csv'));
        const snortLogFiles = snortLogList.filter(file => file.name.startsWith('snort.log.'));

        let newFiles = [];

        // Fetch new CSV alert files
        for (let file of alertFiles) {
            if (!downloadedFiles.includes(file.name)) {
                const localPath = `uploads/${file.name}`;
                await sftp.get(`/home/root/${file.name}`, localPath);
                downloadedFiles.push(file.name);
                newFiles.push(file.name);

                // Upload file
                const alerts = [];
                fs.createReadStream(localPath)
                    .pipe(csv.parse({ headers: true }))
                    .on('data', row => {
                        alerts.push(row);
                    })
                    .on('end', async () => {
                        try {
                            const uniqueAlerts = alerts.filter((alert, index, self) =>
                                index === self.findIndex((a) => a.mac === alert.mac)
                            );
                            await Alert.insertMany(uniqueAlerts, { ordered: false });
                        } catch (error) {
                            console.error('Error uploading alerts:', error);
                        }
                    });
            }
        }

        // Fetch new Snort log files
        for (let logFile of snortLogFiles) {
            if (!downloadedFiles.includes(logFile.name)) {
                const localLogPath = `uploads/${logFile.name}`;
                await sftp.get(`/var/log/snort/${logFile.name}`, localLogPath);
                downloadedFiles.push(logFile.name);
                newFiles.push(logFile.name);
            }
        }

        await sftp.end();

        if (newFiles.length > 0) {
            res.status(200).json({ message: `${newFiles.length} new file(s) successfully fetched and uploaded.` });
        } else {
            res.status(200).json({ message: 'No new files found for download.' });
        }
    } catch (error) {
        console.error('Error with SFTP connection or file access:', error);
        res.status(500).send('Error fetching files over SFTP.');
    }
});

// Multer setup for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Route to upload alerts from CSV
router.post('/upload', upload.single('file'), async (req, res) => {
    const alerts = [];
    fs.createReadStream(req.file.path)
        .pipe(csv.parse({ headers: true }))
        .on('data', row => {
            alerts.push(row);
        })
        .on('end', async () => {
            try {
                const uniqueAlerts = alerts.filter((alert, index, self) =>
                    index === self.findIndex((a) => a.mac === alert.mac)
                );
                await Alert.insertMany(uniqueAlerts, { ordered: false });
                res.status(200).send('Alerts successfully uploaded');
            } catch (error) {
                if (error.code === 11000) {
                    const duplicateField = error.keyValue ? error.keyValue.mac : 'unknown';
                    res.status(400).json({ message: 'Duplicate entry detected: ' + duplicateField });
                } else {
                    console.error('Error saving alerts:', error);
                    res.status(500).send('Error saving alerts to the database');
                }
            }
        });
});

// Route to get all alerts with optional filters
router.get('/', async (req, res) => {
    try {
        const query = {};
        if (req.query.srcIP) {
            query.srcIP = req.query.srcIP;
        }
        if (req.query.destIP) {
            query.destIP = req.query.destIP;
        }
        if (req.query.commProtocol) {
            query.commProtocol = req.query.commProtocol;
        }
        const alerts = await Alert.find(query).sort({ timeStamp: -1 });
        res.json(alerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).send('Error fetching alerts from the database');
    }
});

//// Route to get log details related to a specific alert
//router.get('/log-details/:alertId', async (req, res) => {
    //const alertId = req.params.alertId;

    //// Validate ObjectId
    //if (!mongoose.isValidObjectId(alertId)) {
        //console.error("Invalid Alert ID provided:", alertId);
        //return res.status(400).json({ message: "Invalid Alert ID provided." });
    //}

    //try {
        //// Fetch the alert information from the database
        //const alert = await Alert.findById(alertId);
        //if (!alert) {
            //return res.status(404).json({ message: 'Alert not found.' });
        //}

        //const logDirectory = path.join(__dirname, '../uploads');
        //const snortLogFiles = fs.readdirSync(logDirectory).filter(file => file.startsWith('snort.log.'));

        //let logDetails = [];

        //// Iterate over each Snort `.pcap` file to extract relevant entries
        //for (let logFile of snortLogFiles) {
            //const logFilePath = path.join(logDirectory, logFile);
            //const pythonScriptPath = path.join(__dirname, '../public/parse_pcap.py');
            //const command = `python3 ${pythonScriptPath} ${logFilePath}`;

            //// Using a new async function to handle `exec` and returning a promise
            //const execCommand = async () => {
                //return new Promise((resolve, reject) => {
                    //exec(command, (error, stdout, stderr) => {
                        //console.log('Executing command:', command);
                        //if (stderr) console.error('Script stderr:', stderr);
                        //if (error) {
                            //console.error(`Error while fetching log details: ${stderr}`);
                            //return reject('Error while fetching log details.');
                        //}
                        //try {
                            //const parsedLogs = JSON.parse(stdout);

                            //// Filter logs based on matching timestamp
                            //const alertTimestamp = alert.timeStamp.split(' ')[0]; // Extract date and time without milliseconds
                            //const matchingLogs = parsedLogs.filter(log => {
                                //const logTimestamp = log.timestamp.split('.')[0]; // Extract the main part without milliseconds
                                //return logTimestamp === alertTimestamp;
                            //});

                            //if (matchingLogs.length > 0) {
                                //logDetails.push(...matchingLogs);
                            //}
                            //resolve();
                        //} catch (e) {
                            //console.error('Error parsing log details:', e);
                            //reject('Error parsing log details.');
                        //}
                    //});
                //});
            //};

            //// Wait for the command to execute and process the output
            //await execCommand();
        //}

        //res.status(200).json({
            //message: logDetails.length > 0 ? 'Log details found' : 'No log details found',
            //alert: alert,
            //logDetails: logDetails
        //});
    //} catch (error) {
        //console.error('Error fetching log details:', error);
        //res.status(500).send('Error fetching log details.');
    //}
//});

// Route to delete all alerts
router.delete('/delete-all', async (req, res) => {
    try {
        const result = await Alert.deleteMany({});
        if (result.deletedCount > 0) {
            res.status(200).json({ message: `${result.deletedCount} alerts successfully deleted.` });
        } else {
            res.status(404).json({ message: 'No alerts found to delete.' });
        }
    } catch (error) {
        console.error('Error deleting all alerts:', error);
        res.status(500).send('Error deleting all alerts.');
    }
});

// Route to delete selected alerts
router.post('/delete-multiple', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || ids.length === 0) {
            return res.status(400).json({ message: 'No IDs provided for deletion.' });
        }

        const result = await Alert.deleteMany({ _id: { $in: ids } });
        if (result.deletedCount > 0) {
            res.status(200).json({ message: `${result.deletedCount} alerts successfully deleted.` });
        } else {
            res.status(404).json({ message: 'No alerts found to delete.' });
        }
    } catch (error) {
        console.error('Error deleting alerts:', error);
        res.status(500).send('Error deleting alerts.');
    }
});

module.exports = router;

