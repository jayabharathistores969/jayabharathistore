require('dotenv').config({ path: './temp.env' });

console.log('Environment Check:');
console.log('------------------');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? 'Set (length: ' + process.env.BREVO_API_KEY.length + ')' : 'Not set');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('------------------'); 