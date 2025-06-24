// Set REACT_APP_API_URL in your deployment environment to your backend's public URL
export const config = {
  API_URL: process.env.REACT_APP_API_URL || 'https://backend-rivb9gvi2-yogeshs-projects-6544e7db.vercel.app/api',
  APP_NAME: 'JayaBharathi Store',
  API_TIMEOUT: 10000 // 10 seconds
}; 