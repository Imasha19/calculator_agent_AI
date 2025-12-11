# 🚀 Deployment Guide - Agentic Calculator

Complete guide to deploy your Agentic Calculator to production environments.

## 📋 Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Full Stack Deployment Options](#full-stack-deployment-options)
5. [Production Configuration](#production-configuration)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## ✅ Pre-Deployment Checklist

- [ ] Node.js 20.19+ or 22.12+ installed on server
- [ ] OpenRouter API key obtained and validated
- [ ] Environment variables configured
- [ ] Both backend and frontend tested locally
- [ ] Git repository initialized and committed
- [ ] Database/storage plan finalized (if adding persistence)
- [ ] SSL certificate obtained (for HTTPS)
- [ ] Domain name registered (optional)

---

## 🔙 Backend Deployment

### Option 1: Deploy on Heroku (Easiest)

#### Prerequisites
- Heroku account (heroku.com)
- Heroku CLI installed
- Git initialized in your project

#### Steps

1. **Login to Heroku**
```bash
heroku login
```

2. **Create a new Heroku app**
```bash
cd agentic-calculator-backend
heroku create your-app-name
```

3. **Set environment variables**
```bash
heroku config:set OPENROUTER_API_KEY=your_api_key_here
heroku config:set PORT=5000
```

4. **Create Procfile** in `agentic-calculator-backend/`:
```
web: node server.js
```

5. **Deploy**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

6. **View logs**
```bash
heroku logs --tail
```

Backend will be available at: `https://your-app-name.herokuapp.com`

---

### Option 2: Deploy on Railway (Recommended)

#### Prerequisites
- Railway account (railway.app)
- GitHub repository connected

#### Steps

1. **Go to railway.app** and sign up

2. **Connect your GitHub repository**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure variables**
   - Go to Project Settings
   - Add variables:
     - `OPENROUTER_API_KEY`: your_api_key
     - `PORT`: 5000
     - `NODE_ENV`: production

4. **Set start command**
   - In Railway, add root directory: `agentic-calculator-backend`
   - Or add to `package.json`:
   ```json
   "scripts": {
     "start": "node server.js"
   }
   ```

5. **Deploy automatically** (pushes to main trigger deployment)

Backend will be available at: `https://your-project.up.railway.app`

---

### Option 3: Deploy on DigitalOcean App Platform

#### Prerequisites
- DigitalOcean account
- GitHub repository connected

#### Steps

1. **Go to DigitalOcean App Platform**
   - Click "Create Apps"
   - Select GitHub and authorize
   - Choose your repository

2. **Configure the app**
   - Source: `agentic-calculator-backend`
   - Build command: `npm install`
   - Run command: `node server.js`
   - Port: 5000

3. **Set environment variables**
   - Add `OPENROUTER_API_KEY`
   - Add `PORT=5000`
   - Add `NODE_ENV=production`

4. **Deploy**

Backend will be accessible at: `https://your-app-xxxxxxxx.ondigitalocean.app`

---

### Option 4: Deploy on Self-Hosted Server (VPS)

#### Prerequisites
- Ubuntu/Debian VPS (AWS EC2, Linode, DigitalOcean Droplet, etc.)
- SSH access to server
- Node.js 20.19+ installed on server

#### Steps

1. **Connect to your server**
```bash
ssh root@your_server_ip
```

2. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install PM2 (process manager)**
```bash
sudo npm install -g pm2
```

4. **Clone your repository**
```bash
git clone https://github.com/Imasha19/calculator_agent_AI.git
cd "calculator agent"
cd agentic-calculator-backend
npm install
```

5. **Create `.env` file**
```bash
nano .env
```
Add:
```env
OPENROUTER_API_KEY=your_api_key_here
PORT=5000
NODE_ENV=production
```

6. **Start with PM2**
```bash
pm2 start server.js --name "calculator-backend"
pm2 save
pm2 startup
```

7. **Setup Nginx as reverse proxy**
```bash
sudo apt-get install -y nginx
```

Edit `/etc/nginx/sites-available/default`:
```nginx
upstream backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

8. **Test Nginx and restart**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

9. **Setup SSL with Let's Encrypt**
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Backend will be available at: `https://your-domain.com`

---

## 🎨 Frontend Deployment

### Option 1: Deploy on Vercel (Easiest for React)

#### Prerequisites
- Vercel account (vercel.com)
- GitHub repository

#### Steps

1. **Go to vercel.com** and sign up

2. **Import your repository**
   - Click "Import Project"
   - Select GitHub repo
   - Choose "Calculator agent/agentic-calculator-frontend"

3. **Configure build settings**
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
   - Root directory: `agentic-calculator-frontend`

4. **Add environment variables**
   - Add `VITE_API_URL`: your-backend-url.com (e.g., https://calculator-backend.herokuapp.com)

5. **Deploy**

Frontend will be available at: `https://your-project.vercel.app`

---

### Option 2: Deploy on Netlify

#### Prerequisites
- Netlify account (netlify.com)
- GitHub repository

#### Steps

1. **Go to netlify.com** and sign up

2. **Connect your repository**
   - Click "Add new site"
   - Select "Import an existing project"
   - Choose GitHub
   - Select your repository

3. **Configure build settings**
   - Base directory: `agentic-calculator-frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Set environment variables**
   - In Site Settings → Build & Deploy → Environment
   - Add `VITE_API_URL`: your-backend-url.com

5. **Update frontend API call**

In `agentic-calculator-frontend/src/App.jsx`, replace:
```javascript
const API_URL = process.env.VITE_API_URL || "http://localhost:5000";

// Then use:
const res = await fetch(`${API_URL}/ask`, {
```

6. **Deploy**

Frontend will be available at: `https://your-site.netlify.app`

---

### Option 3: Deploy on GitHub Pages (Static Only)

#### Note: Only works if serving pre-built static files

1. **Build your frontend**
```bash
cd agentic-calculator-frontend
npm run build
```

2. **Create gh-pages branch**
```bash
git checkout --orphan gh-pages
git rm -rf .
cp -r dist/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

3. **Enable in GitHub**
   - Go to repository Settings
   - Pages → Source: gh-pages branch
   - Save

Available at: `https://yourusername.github.io/calculator_agent_AI`

---

### Option 4: Deploy with Docker

#### Prerequisites
- Docker installed
- Docker Hub account (optional)

1. **Create Dockerfile in project root**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy backend
COPY agentic-calculator-backend ./agentic-calculator-backend
RUN cd agentic-calculator-backend && npm install

# Copy frontend
COPY agentic-calculator-frontend ./agentic-calculator-frontend
RUN cd agentic-calculator-frontend && npm install && npm run build

WORKDIR /app/agentic-calculator-backend

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server.js"]
```

2. **Build image**
```bash
docker build -t calculator-agent .
```

3. **Run container**
```bash
docker run -p 5000:5000 \
  -e OPENROUTER_API_KEY=your_api_key \
  calculator-agent
```

4. **Push to Docker Hub (optional)**
```bash
docker tag calculator-agent yourusername/calculator-agent
docker push yourusername/calculator-agent
```

---

## 🔧 Full Stack Deployment Options

### Option A: Heroku (Backend) + Vercel (Frontend)

**Best for**: Quick, serverless deployment

1. Deploy backend on Heroku (see Option 1 above)
2. Deploy frontend on Vercel (see Option 1 above)
3. In frontend, set `VITE_API_URL` to Heroku backend URL
4. Update CORS in backend `server.js`:
```javascript
app.use(cors({
  origin: "https://your-frontend.vercel.app",
  credentials: true
}));
```

---

### Option B: Railway (Backend) + Netlify (Frontend)

**Best for**: Modern, Git-integrated deployment

1. Deploy backend on Railway
2. Deploy frontend on Netlify
3. Link the API URL in frontend environment variables
4. Both services auto-deploy on git push

---

### Option C: Self-Hosted VPS (Both)

**Best for**: Full control, custom domain

1. Deploy backend on VPS with Nginx + PM2
2. Serve frontend static files from same Nginx server
3. Single domain, both backend and frontend

**Configure Nginx**:
```nginx
upstream backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name your-domain.com;
    root /var/www/calculator-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## ⚙️ Production Configuration

### Environment Variables

**.env (Backend)**
```env
NODE_ENV=production
OPENROUTER_API_KEY=sk-or-v1-xxxx...
PORT=5000
```

**.env (Frontend - optional)**
```env
VITE_API_URL=https://your-api-domain.com
```

### Security Checklist

- [ ] Use HTTPS/SSL certificates
- [ ] Configure CORS properly
- [ ] Set secure headers
- [ ] Validate all user input
- [ ] Rate limit API endpoints
- [ ] Use environment variables for secrets
- [ ] Enable GZIP compression
- [ ] Setup error logging
- [ ] Monitor server health
- [ ] Keep dependencies updated

### Add to Backend for Production

In `server.js`:
```javascript
import helmet from 'helmet'; // Install: npm install helmet
import rateLimit from 'express-rate-limit'; // Install: npm install express-rate-limit

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/ask', limiter);
app.use('/breakdown', limiter);

// GZIP compression
app.use(compression());
```

---

## 📊 Monitoring & Maintenance

### Setup Monitoring

**For Heroku:**
```bash
heroku addons:create papertrail
heroku addons:open papertrail
```

**For Self-Hosted:**
```bash
# Monitor PM2 processes
pm2 monit

# View logs
pm2 logs calculator-backend

# Setup log rotation
pm2 install pm2-logrotate
```

### Uptime Monitoring

Use services like:
- **Uptime Robot** (uptimerobot.com) - Free tier
- **New Relic** (newrelic.com)
- **DataDog** (datadoghq.com)

### Performance Optimization

1. **Enable caching**
```javascript
app.set('view cache', true);
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600');
  next();
});
```

2. **Enable compression**
```bash
npm install compression
```

3. **Setup CDN for frontend** (Cloudflare, etc.)

### Database Backup (if added later)

```bash
# Daily backup
0 2 * * * /backup-script.sh
```

---

## 📈 Scaling

### Horizontal Scaling (Multiple Instances)

**With Heroku:**
```bash
heroku ps:scale web=2
```

**With load balancer (Nginx):**
```nginx
upstream backend {
    server backend1.example.com:5000;
    server backend2.example.com:5000;
    server backend3.example.com:5000;
}
```

### Caching Layer

Add Redis for caching:
```bash
npm install redis
```

---

## 🆘 Troubleshooting Deployment

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Backend not running, check logs |
| CORS errors | Update CORS origin in server.js |
| Environment variables not loading | Check .env file exists, restart app |
| Frontend can't reach backend | Verify backend URL in frontend config |
| High memory usage | Check for memory leaks, restart process |
| Slow responses | Add caching, optimize queries |

---

## 📚 Additional Resources

- [Heroku Node.js Deployment](https://devcenter.heroku.com/articles/nodejs-support)
- [Vercel React Deployment](https://vercel.com/docs/frameworks/react)
- [Railway Deployment Docs](https://docs.railway.app)
- [DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform)
- [Nginx Reverse Proxy Setup](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)

---

## ✨ Quick Deployment Summary

**Fastest (5 mins):**
- Backend: Heroku
- Frontend: Vercel
- Total: Ready in 5 minutes

**Best Balance (15 mins):**
- Backend: Railway
- Frontend: Netlify
- Total: Ready in 15 minutes

**Most Control (1-2 hours):**
- Both: Self-hosted VPS
- Setup: Nginx + PM2 + SSL
- Total: Full ownership

---

**Happy Deploying! 🎉**
