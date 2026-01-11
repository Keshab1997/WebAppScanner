# SSL Setup Instructions

## Install mkcert

### macOS:
```bash
brew install mkcert
```

### Windows:
```bash
choco install mkcert
```

## Generate SSL Certificates

1. Install the local CA:
```bash
mkcert -install
```

2. Generate certificates (replace YOUR_COMPUTER_IP with your actual IP):
```bash
mkcert localhost 127.0.0.1 YOUR_COMPUTER_IP
```

This will create:
- localhost+2.pem (certificate)
- localhost+2-key.pem (private key)

## Run the Server

```bash
node server.js
```

## GitHub Pages Setup

1. Create a new GitHub repository
2. Upload only the files from the `public` folder:
   - index.html
   - style.css
   - script.js
3. Enable GitHub Pages in repository settings
4. Visit your GitHub Pages URL on mobile
5. Enter your computer's IP when prompted