# SuperMega + YTF Infrastructure Plan

**Goal**: Deploy YTF system on AWS, integrate with SuperMega infrastructure, set up proper email communication

---

## CURRENT STATE

### Domain: supermega.dev
- **Registrar**: Google Domains
- **DNS**: Pointing to GitHub Pages (swanhtet01.github.io)
- **Email**: Google Workspace
  - swanhtet@supermega.dev (working)
  - devteam@supermega.dev (not configured)

### GitHub
- **Main Site**: swanhtet01.github.io → supermega.dev
- **Repos**: 23 repositories including SuperMega, InboxBrain, InsightFactory, etc.
- **Status**: GitHub Pages active, redirects to supermega-platform.html

### AWS
- **Instance**: Accessible via SSH
- **Services**: All DOWN (CONNECTION REFUSED)
  - Main site
  - Platform
  - Creative API
  - Data API
  - Productivity API
- **Backend APIs**: NOT RUNNING
- **Last Check**: August 29, 2025

### YTF System
- **Status**: Running on Manus dev server
- **Database**: TiDB Cloud
- **Features**: Login, Dashboard, Production entry, Language toggle
- **Needs**: Production deployment

---

## DEPLOYMENT PLAN

### Phase 1: AWS Infrastructure Setup
1. Create EC2 instance (if not exists) or restart existing
2. Install Node.js, pnpm, nginx
3. Set up PM2 for process management
4. Configure firewall and security groups
5. Set up SSL certificates (Let's Encrypt)

### Phase 2: YTF Deployment
1. Create GitHub repo: swanhtet01/yangon-tyre-bms
2. Push YTF code to GitHub
3. Set up GitHub Actions for CI/CD
4. Deploy to AWS EC2
5. Configure subdomain: ytf.supermega.dev or factory.supermega.dev

### Phase 3: Email Configuration
1. Access Google Workspace admin
2. Create devteam@supermega.dev group/alias
3. Add team members
4. Configure forwarding rules
5. Set up SMTP for system notifications

### Phase 4: Integration
1. Link YTF with SuperMega platform
2. Unified authentication (if needed)
3. Cross-platform analytics
4. Shared user management

### Phase 5: Monitoring & Maintenance
1. Set up CloudWatch
2. Configure alerts
3. Automated backups
4. Health check endpoints
5. Status dashboard

---

## SUBDOMAIN STRUCTURE

```
supermega.dev                  → Main platform (GitHub Pages)
├── ytf.supermega.dev         → YTF Management System (AWS)
├── api.supermega.dev         → Backend APIs (AWS)
├── platform.supermega.dev    → SuperMega Platform (AWS)
├── creative.supermega.dev    → Creative Studio (AWS)
├── data.supermega.dev        → Data Intelligence (AWS)
└── productivity.supermega.dev → Productivity Engine (AWS)
```

---

## IMMEDIATE ACTIONS

1. ✅ Review existing infrastructure
2. ⏳ Create YTF GitHub repository
3. ⏳ Prepare deployment scripts
4. ⏳ Set up AWS environment
5. ⏳ Configure DNS records
6. ⏳ Deploy YTF system
7. ⏳ Set up email
8. ⏳ Document everything

---

## TECH STACK

### YTF System
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, tRPC
- **Database**: TiDB Cloud (MySQL compatible)
- **Auth**: JWT + bcrypt
- **Deployment**: AWS EC2, nginx, PM2

### Infrastructure
- **DNS**: Google Domains
- **Hosting**: AWS EC2
- **CDN**: CloudFront (optional)
- **SSL**: Let's Encrypt
- **CI/CD**: GitHub Actions
- **Monitoring**: CloudWatch

---

## NEXT STEPS

Starting with creating GitHub repository and preparing deployment...

