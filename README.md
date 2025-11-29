# SocialFlow - Social Media Management SaaS

A comprehensive, enterprise-grade social media management platform built with Next.js 14, React, Styled Components, and Supabase. Manage all your social media accounts, schedule posts, track analytics, monitor mentions, and collaborate with your team - all in one place.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Features

### Core Features
- ✅ **Multi-Platform Support** - Instagram, Facebook, LinkedIn, Twitter/X
- ✅ **Post Scheduling** - Schedule posts with auto-publishing via cron jobs
- ✅ **Content Calendar** - Visual calendar for planning content
- ✅ **Media Library** - Organize and manage media assets
- ✅ **Team Collaboration** - Multi-user workspaces with role-based permissions
- ✅ **Analytics Dashboard** - Real-time performance metrics and insights

### Advanced Features
- 📊 **Advanced Analytics** - Best posting times, engagement trends, platform comparison
- 🎯 **Competitor Tracking** - Monitor competitor performance and growth
- 📧 **Email Notifications** - Welcome, digest, and alert emails via Resend
- 👂 **Social Listening** - Track mentions, hashtags, and keywords
- ✅ **Approval Workflows** - Multi-step content approval process
- 🔗 **Link in Bio** - Customizable landing pages for social profiles
- 📄 **White-Label PDF Reports** - Generate branded analytics reports
- 🤖 **Automated Tasks** - Cron jobs for publishing and data collection

### Technical Features
- 🔐 **Authentication** - Secure auth with Supabase (email/password)
- 🎨 **Modern UI** - Styled Components with theme support
- 📱 **Responsive Design** - Works seamlessly on all devices
- ⚡ **Server-Side Rendering** - Fast page loads with Next.js App Router
- 🔄 **Real-time Updates** - Live data synchronization
- 🌐 **API Routes** - RESTful API endpoints for all features

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Social Media API Setup](#social-media-api-setup)
- [Email Setup](#email-setup)
- [Cron Jobs](#cron-jobs)
- [Development](#development)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **Styled Components** - CSS-in-JS styling
- **Lucide React** - Modern icon library
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Recharts** - Charts and data visualization
- **React Hot Toast** - Toast notifications
- **date-fns** - Date manipulation
- **@dnd-kit** - Drag and drop

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Row Level Security
  - Real-time subscriptions
- **Supabase SSR** - Server-side rendering support

### Integrations
- **Resend** - Email delivery
- **Instagram Graph API** - Instagram integration
- **Facebook Graph API** - Facebook integration
- **LinkedIn API** - LinkedIn integration
- **Twitter/X API** - Twitter integration
- **Stripe** - Payment processing (optional)
- **OpenAI** - AI features (optional)

### Additional Libraries
- **pdfmake** - PDF generation
- **xlsx** - Excel file handling
- **jsPDF** - Additional PDF support

## 🚦 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and npm installed
- **Supabase account** - [Sign up here](https://supabase.com)
- **Resend account** - [Sign up here](https://resend.com)
- **Social Media Developer Accounts**:
  - [Meta for Developers](https://developers.facebook.com) (Instagram & Facebook)
  - [LinkedIn Developers](https://www.linkedin.com/developers)
  - [Twitter Developer Portal](https://developer.twitter.com)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd social-media-saas
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and fill in your credentials (see [Environment Variables](#environment-variables))

4. **Set up the database:**
   ```bash
   chmod +x scripts/setup-db.sh
   ./scripts/setup-db.sh
   ```

   Or manually run migrations in Supabase SQL Editor (see [Database Setup](#database-setup))

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
social-media-saas/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── dashboard/                # Dashboard routes
│   │   ├── posts/                # Post management
│   │   ├── calendar/             # Content calendar
│   │   ├── analytics/            # Analytics & insights
│   │   │   ├── competitors/      # Competitor tracking
│   │   │   └── best-times/       # Best posting times
│   │   ├── listening/            # Social listening
│   │   ├── approvals/            # Content approval
│   │   ├── team/                 # Team management
│   │   └── settings/             # Settings
│   ├── bio/[slug]/               # Link in bio public pages
│   ├── api/                      # API routes
│   │   ├── auth/                 # Auth endpoints
│   │   ├── posts/                # Post management
│   │   ├── analytics/            # Analytics endpoints
│   │   ├── competitors/          # Competitor tracking
│   │   ├── listening/            # Social listening
│   │   ├── approvals/            # Approval workflows
│   │   ├── bio/                  # Link in bio
│   │   ├── notifications/        # Email preferences
│   │   ├── reports/              # PDF reports
│   │   └── cron/                 # Automated tasks
│   │       ├── publish-posts/    # Auto-publish posts
│   │       ├── collect-analytics/# Daily analytics
│   │       └── collect-mentions/ # Social listening
│   └── layout.js                 # Root layout
├── components/                   # React components
│   ├── dashboard/                # Dashboard components
│   ├── analytics/                # Analytics components
│   ├── forms/                    # Form components
│   └── ui/                       # UI components
├── lib/                          # Utility functions
│   ├── supabase/                 # Supabase config
│   │   ├── client.js
│   │   ├── server.js
│   │   └── middleware.js
│   ├── email/                    # Email system
│   │   ├── templates/            # Email templates
│   │   │   ├── base.js
│   │   │   ├── welcome.js
│   │   │   ├── digest.js
│   │   │   └── alert.js
│   │   └── sender.js             # Email sender utility
│   ├── integrations/             # Social media APIs
│   │   ├── instagram.js
│   │   ├── facebook.js
│   │   ├── linkedin.js
│   │   └── twitter.js
│   ├── reports/                  # Report generation
│   │   └── pdfGenerator.js
│   └── utils/                    # Utilities
├── supabase/                     # Database migrations
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_posts_and_media.sql
│       ├── 003_analytics.sql
│       ├── 004_social_accounts.sql
│       ├── 005_workspaces.sql
│       ├── 006_advanced_features.sql
│       └── 007_email_notifications.sql
├── scripts/                      # Utility scripts
│   └── setup-db.sh               # Database setup script
├── styles/                       # Global styles
│   ├── theme.js
│   └── GlobalStyles.js
├── vercel.json                   # Vercel cron configuration
├── .env.example                  # Environment variables template
├── README.md                     # This file
└── docs/                         # Documentation
    ├── README.md                 # Project overview
    ├── META_INTEGRATION.md       # Facebook/Instagram OAuth
    ├── INBOX.md                  # DM functionality
    ├── API_REFERENCE.md          # API endpoints
    └── DATABASE.md               # Database schema
```

## 🔐 Environment Variables

See [.env.example](.env.example) for a complete list of environment variables.

### Required Variables

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email (Resend)
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=SocialFlow <notifications@yourdomain.com>

# Cron Jobs
CRON_SECRET=your_secure_random_string
```

### Social Media APIs (for features)

```env
# Instagram
INSTAGRAM_CLIENT_ID=your_instagram_app_id
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret

# Facebook
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Twitter/X
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
```

### Optional Variables

```env
# AI Features
OPENAI_API_KEY=your_openai_api_key

# Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_pk
STRIPE_SECRET_KEY=your_stripe_sk
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

## 🗄 Database Setup

### Option 1: Using the Setup Script (Recommended)

```bash
chmod +x scripts/setup-db.sh
./scripts/setup-db.sh
```

### Option 2: Manual Migration

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_posts_and_media.sql`
   - `supabase/migrations/003_analytics.sql`
   - `supabase/migrations/004_social_accounts.sql`
   - `supabase/migrations/005_workspaces.sql`
   - `supabase/migrations/006_advanced_features.sql`
   - `supabase/migrations/007_email_notifications.sql`

### Database Schema Overview

- **auth.users** - Supabase authentication users
- **user_profiles** - Extended user information
- **workspaces** - Multi-tenant workspaces
- **workspace_users** - User-workspace relationships
- **social_accounts** - Connected social media accounts
- **posts** - Scheduled and published posts
- **post_media** - Media files for posts
- **post_analytics** - Performance metrics
- **competitors** - Competitor tracking
- **listening_keywords** - Social listening keywords
- **listening_mentions** - Collected mentions
- **approval_workflows** - Content approval settings
- **post_approvals** - Approval requests
- **bio_pages** - Link in bio pages
- **notification_preferences** - Email preferences
- **email_logs** - Email delivery logs

## 🔌 Social Media API Setup

### Instagram & Facebook

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create a new app
3. Add Instagram Basic Display and Facebook Login products
4. Configure OAuth redirect URIs:
   - `http://localhost:3000/api/auth/callback/instagram`
   - `http://localhost:3000/api/auth/callback/facebook`
5. Get App ID and App Secret
6. Add to `.env.local`

### LinkedIn

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers)
2. Create a new app
3. Add Sign In with LinkedIn product
4. Configure OAuth redirect URI:
   - `http://localhost:3000/api/auth/callback/linkedin`
5. Get Client ID and Client Secret
6. Add to `.env.local`

### Twitter/X

1. Go to [Twitter Developer Portal](https://developer.twitter.com)
2. Create a new project and app
3. Enable OAuth 2.0
4. Configure OAuth redirect URI:
   - `http://localhost:3000/api/auth/callback/twitter`
5. Get API Key, API Secret, and Bearer Token
6. Add to `.env.local`

## 📧 Email Setup

### Resend Configuration

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain:
   - Add DNS records (MX, TXT, CNAME)
   - Wait for verification
3. Create an API key
4. Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_your_api_key
   EMAIL_FROM=SocialFlow <notifications@yourdomain.com>
   ```

See [docs/README.md](docs/README.md) for complete documentation.

## ⏰ Cron Jobs

The platform includes automated tasks via Vercel Cron:

### 1. Auto-Publish Posts (Every 5 minutes)
```
Path: /api/cron/publish-posts
Schedule: */5 * * * *
```
Automatically publishes scheduled posts to social media platforms.

### 2. Collect Analytics (Daily at 2 AM)
```
Path: /api/cron/collect-analytics
Schedule: 0 2 * * *
```
Collects daily analytics from all connected social accounts.

### 3. Collect Mentions (Every 6 hours)
```
Path: /api/cron/collect-mentions
Schedule: 0 */6 * * *
```
Monitors social media for mentions, hashtags, and keywords.

### Configuration

Cron jobs are configured in `vercel.json` and secured with `CRON_SECRET`.

See [docs/API_REFERENCE.md](docs/API_REFERENCE.md) for API endpoint documentation.

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
./scripts/setup-db.sh  # Run database migrations
```

### Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

3. **Test locally:**
   ```bash
   npm run dev
   ```

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add your feature"
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**

## 🚀 Deployment

See [docs/README.md](docs/README.md) for deployment instructions.

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Import repository to Vercel
3. Configure environment variables
4. Deploy

The cron jobs will automatically start running on Vercel.

### Other Platforms

The app can be deployed to:
- Netlify
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify

## 📚 Documentation

All documentation is in the `/docs/` folder:

- [docs/README.md](docs/README.md) - Project overview and quick start
- [docs/META_INTEGRATION.md](docs/META_INTEGRATION.md) - Facebook/Instagram OAuth setup
- [docs/INBOX.md](docs/INBOX.md) - Inbox & DM functionality
- [docs/API_REFERENCE.md](docs/API_REFERENCE.md) - Complete API reference
- [docs/DATABASE.md](docs/DATABASE.md) - Database schema and queries

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use ESLint for code linting
- Follow React best practices
- Write descriptive commit messages
- Add comments for complex logic
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - Amazing React framework
- **Supabase** - Backend infrastructure
- **Vercel** - Hosting and deployment
- **Resend** - Email delivery
- **Meta** - Instagram and Facebook APIs
- **LinkedIn** - LinkedIn API
- **Twitter** - Twitter/X API
- All open-source contributors

## 📞 Support

- **Documentation**: Check the docs in this repository
- **Issues**: [GitHub Issues](https://github.com/yourusername/social-media-saas/issues)
- **Email**: support@socialflow.com
- **Discord**: [Join our community](https://discord.gg/socialflow)

## 🗺 Roadmap

- [ ] TikTok integration
- [ ] YouTube integration
- [ ] Advanced AI content generation
- [ ] Team messaging/chat
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Advanced analytics with custom reports
- [ ] Multi-language support
- [ ] White-label solution

---

**Built with ❤️ using Next.js, React, and Supabase**

**Star ⭐ this repository if you found it helpful!**
