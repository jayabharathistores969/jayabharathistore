export const config = {
  API_URL: process.env.NODE_ENV === 'development' 
    ? process.env.REACT_APP_API_URL || 'http://localhost:5001/api'
    : process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  APP_NAME: 'JayaBharathi Store',
  API_TIMEOUT: 10000 // 10 seconds
}; 