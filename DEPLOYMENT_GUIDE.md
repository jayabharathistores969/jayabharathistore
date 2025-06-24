# Complete Netlify Deployment Guide

## Prerequisites
- GitHub account
- Netlify account
- Vercel account (for backend)
- MongoDB Atlas account (for database)

## Step 1: Deploy Backend to Vercel

### 1.1 Prepare Backend Repository
1. Create a new GitHub repository for your backend
2. Push your backend code to the repository
3. Make sure you have the following files in your backend:
   - `vercel.json` (already created)
   - `package.json` with build script (already updated)

### 1.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your backend repository
5. Configure environment variables:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```
6. Click "Deploy"
7. Copy the deployment URL (e.g., `https://your-backend.vercel.app`)

## Step 2: Deploy Frontend to Netlify

### 2.1 Prepare Frontend Repository
1. Create a new GitHub repository for your frontend
2. Push your frontend code to the repository
3. Make sure you have the following files in your frontend:
   - `netlify.toml` (already created)
   - `public/_redirects` (already created)

### 2.2 Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login with GitHub
3. Click "New site from Git"
4. Choose your frontend repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Click "Deploy site"

### 2.3 Configure Environment Variables
1. Go to Site settings > Environment variables
2. Add the following variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.vercel.app/api
   ```
3. Redeploy the site

## Step 3: Configure Domain and SSL

### 3.1 Custom Domain (Optional)
1. In Netlify dashboard, go to Domain settings
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

### 3.2 SSL Certificate
- Netlify automatically provides SSL certificates
- No additional configuration needed

## Step 4: Update CORS Settings

### 4.1 Backend CORS Configuration
Update your backend `server.js` to allow your Netlify domain:

```javascript
app.use(cors({
  origin: [
    'https://your-netlify-app.netlify.app',
    'https://your-custom-domain.com',
    'http://localhost:3000' // for development
  ],
  credentials: true
}));
```

## Step 5: Test Your Deployment

### 5.1 Test Backend
1. Visit your Vercel backend URL
2. Test API endpoints
3. Check logs in Vercel dashboard

### 5.2 Test Frontend
1. Visit your Netlify frontend URL
2. Test all functionality
3. Check browser console for errors

## Step 6: Monitor and Maintain

### 6.1 Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor performance with Netlify Analytics
- Set up uptime monitoring

### 6.2 Continuous Deployment
- Both Netlify and Vercel automatically deploy on git push
- Set up branch deployments for testing

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Update backend CORS settings
2. **Environment Variables**: Double-check variable names
3. **Build Failures**: Check build logs in deployment dashboard
4. **API Connection**: Verify backend URL is correct

### Useful Commands:
```bash
# Test build locally
cd frontend
npm run build

# Test backend locally
cd backend
npm start
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **API Keys**: Use environment variables for all secrets
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Implement rate limiting on your API
5. **Input Validation**: Validate all user inputs

## Performance Optimization

1. **Image Optimization**: Use Netlify's image optimization
2. **Caching**: Implement proper caching headers
3. **CDN**: Netlify provides global CDN automatically
4. **Bundle Size**: Monitor and optimize JavaScript bundle size

## Support Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/) 