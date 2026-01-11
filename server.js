// server.js (Updated for HTTPS)

const https = require('https');
const fs = require('fs');
const express = require('express');
const robot = require('robotjs');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();
const port = 3000;

// SSL সার্টিফিকেট ফাইলগুলোর পাথ
const options = {
  key: fs.readFileSync('./localhost+2-key.pem'),
  cert: fs.readFileSync('./localhost+2.pem')
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// মূল রুটে ('/') কেউ ভিজিট করলে index.html ফাইলটি দেখানোর জন্য
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// '/scan' নামে একটি API এন্ডপয়েন্ট তৈরি করা
app.post('/scan', (req, res) => {
    const { barcode } = req.body;

    if (barcode) {
        console.log(`Received Barcode: ${barcode}`);
        try {
            // প্রাপ্ত বারকোডটি টাইপ করা
            robot.typeString(barcode);
            
            // টাইপ করার পর Enter বাটন চাপা (POS সফটওয়্যারের জন্য)
            robot.keyTap('enter');
            
            res.status(200).json({ message: 'Barcode processed successfully!' });
        } catch (error) {
            console.error("RobotJS Error:", error);
            res.status(500).json({ message: 'Failed to simulate keyboard input.' });
        }
    } else {
        res.status(400).json({ message: 'No barcode data received.' });
    }
});

// HTTPS সার্ভার তৈরি এবং চালু করা
https.createServer(options, app).listen(port, () => {
    const interfaces = os.networkInterfaces();
    let ipAddress = '';
    for (const key in interfaces) {
        for (const iface of interfaces[key]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ipAddress = iface.address;
                break;
            }
        }
        if (ipAddress) break;
    }

    console.log(`Secure server is running!`);
    console.log(`ফ্রন্টএন্ড এই সার্ভারে ডেটা পাঠাবে: https://${ipAddress}:${port}`);
    console.log(`লোকাল সার্ভার চালু আছে। এখন আপনি GitHub পেজ ভিজিট করতে পারেন।`);
});