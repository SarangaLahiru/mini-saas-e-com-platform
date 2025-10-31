const fs = require('fs');
const path = require('path');

const envContent = `# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
VITE_APP_NAME=Electronics Store
VITE_APP_VERSION=1.0.0
`;

const envPath = path.join(__dirname, '.env');

try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('📝 Please update VITE_GOOGLE_CLIENT_ID with your actual Google OAuth Client ID');
} catch (error) {
    console.error('❌ Error creating .env file:', error.message);
}
