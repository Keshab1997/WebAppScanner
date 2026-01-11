// script.js (Updated for GitHub Pages)

window.addEventListener('load', () => {
    const videoElement = document.getElementById('video');
    const resultElement = document.getElementById('result');
    const statusElement = document.getElementById('status');
    let lastScannedBarcode = null;
    let lastScanTime = 0;
    
    // Server IP configuration
    let serverIp = localStorage.getItem('serverIp');
    if (!serverIp) {
        serverIp = prompt("Please enter your computer's local IP address (e.g., 192.168.0.105):");
        if (serverIp) {
            localStorage.setItem('serverIp', serverIp);
        }
    }

    // ZXing কোড রিডার ইনিশিয়েট করা
    const codeReader = new ZXing.BrowserMultiFormatReader();
    console.log('ZXing code reader initialized');

    // ব্যবহারকারীর ক্যামেরাগুলো খুঁজে বের করা
    codeReader.listVideoInputDevices()
        .then((videoInputDevices) => {
            if (videoInputDevices.length > 0) {
                statusElement.textContent = 'Camera found. Starting scanner...';
                // পেছনের ক্যামেরা ব্যবহার করার চেষ্টা করা (যদি থাকে)
                const rearCamera = videoInputDevices.find(device => device.label.toLowerCase().includes('back')) || videoInputDevices[0];
                
                // স্ক্যানিং শুরু করা
                codeReader.decodeFromVideoDevice(rearCamera.deviceId, 'video', (result, err) => {
                    if (result) {
                        const now = Date.now();
                        // একই বারকোড বারবার স্ক্যান হওয়া থেকে বিরত রাখা (3 সেকেন্ডের মধ্যে)
                        if (result.text !== lastScannedBarcode || (now - lastScanTime) > 3000) {
                            console.log('Barcode detected:', result.text);
                            resultElement.textContent = result.text;
                            lastScannedBarcode = result.text;
                            lastScanTime = now;

                            // সার্ভারে বারকোড ডেটা পাঠানো
                            sendDataToServer(result.text);
                        }
                    }
                    if (err && !(err instanceof ZXing.NotFoundException)) {
                        console.error('Scanner error:', err);
                        statusElement.textContent = 'Scanner Error!';
                        statusElement.className = 'status-error';
                    }
                });
            } else {
                statusElement.textContent = 'No camera found!';
                statusElement.className = 'status-error';
                console.error('No video input devices found.');
            }
        })
        .catch((err) => {
            statusElement.textContent = 'Camera access denied!';
            statusElement.className = 'status-error';
            console.error('Camera access error:', err);
        });

    function sendDataToServer(barcodeData) {
        if (!serverIp) {
            alert("Server IP is not set. Please refresh and enter the IP address.");
            return;
        }

        const serverUrl = `https://${serverIp}:3000/scan`;
        statusElement.textContent = `Sending to ${serverUrl}...`;
        
        fetch(serverUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode: barcodeData }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Server response:', data);
            statusElement.textContent = 'Data sent successfully!';
            statusElement.className = 'status-ok';
            setTimeout(() => {
                statusElement.textContent = 'Ready to scan';
            }, 2000);
        })
        .catch((error) => {
            console.error('Error sending data:', error);
            statusElement.textContent = `Failed to connect to server at ${serverUrl}. Is it running?`;
            statusElement.className = 'status-error';
        });
    }
});