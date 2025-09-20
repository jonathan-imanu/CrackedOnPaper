# Cracked On Paper

> A competitive resume review platform that gamifies professional feedback through head-to-head battles

![Landing Page](landing.png)

Built by @tinbetee and @jonathan-imanu

## The Problem

Getting actionable, crowd-sourced feedback on resumes is hard. Discord servers and forums exist, but they lack a structured or engaging way to see how your resume actually stacks up against others.

## The Solution

**CrackedOnPaper** turns resume reviews into a head-to-head competition. Your resume is matched against another candidate's in a "battle," where users vote on which is more impressive ("cracked").

Resumes are anonymized and paired by industry and years of experience (YOE), ensuring fair matchups. After uploading, you'll unlock access to:

- Candid, community feedback on your resume
- Head-to-head comparisons that show how you perform against real candidates
- Statistics and leaderboards so you can track your progress and see where you stand
- ELO rating system for competitive ranking

---

# Technical Architecture

## Frontend

- **Framework**: <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/next_js.png" width=20> Next.js
- **Language**: <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/main/icons/typescript.png" width="20"/> TypeScript
- **Styling**: <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/tailwind_css.png" width="20"/> Tailwind CSS
- UI Components: ShadCN/ui · MagicUI · Radix UI
- Authentication: Supabase Auth with JWT tokens

---

## Backend

- **Language**: <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/main/icons/go.png" width="20"/> Go 1.24.5
- **Framework**: <image src="https://raw.githubusercontent.com/gin-gonic/logo/master/color.png" width=20> Gin
- **File Storage**: <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/main/icons/aws.png" width="20"/> AWS S3-compatible (DigitalOcean Spaces)

---

## Infrastructure

- **Database**: <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/main/icons/postgresql.png" width="20"/> PostgreSQL with SQLC via Supabase
- **File Storage**: <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/digital_ocean.png" width="20">DigitalOcean Spaces with CDN
- **Deployment**: <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/main/icons/docker.png" width="20"/> Docker Compose with <img src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/nginx.png" width=20> Nginx

---

## Key Technical Features

### Advanced PDF Processing

- Client-side PDF rendering with zoom, pan, and rotation
- Server-side PDF to image conversion with quality optimization
- Interactive annotation system with coordinate mapping
- WebP conversion for optimal performance

### Competitive Matchmaking System

- ELO rating system for fair matchups
- Industry and experience-based pairing algorithms
- Real-time battle statistics and leaderboards
- Anonymized resume comparisons

### Interactive Review System

- Detailed annotation system for resume feedback
- Anonymous review system with generated reviewer names
- Review request management with expiration
- JSONB storage for complex annotation data

### Scalable Architecture

- Type-safe database queries with SQLC
- JWT-based authentication with secure middleware
- RESTful API design with proper error handling
- Docker containerization for easy deployment

---

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Go 1.24+
- Docker and Docker Compose
- PostgreSQL (or use Supabase)

### Development Scripts

The project includes convenient development scripts for both Unix/macOS and Windows systems:

**Unix/macOS (cop script):**

```bash
# Make executable and run
chmod +x cop
./cop dev      # Start development environment
./cop prod     # Start production environment
./cop logs     # View logs
./cop stop     # Stop services
```

**Windows (cop.bat script):**

```cmd
cop.bat dev    # Start development environment
cop.bat prod   # Start production environment
cop.bat logs   # View logs
cop.bat stop   # Stop services
```

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd CrackedOnPaper
   ```

2. **Backend Setup**

   ```bash
   cd backend
   go mod download
   cp .env.example .env
   # Configure your environment variables
   go run main.go
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local
   # Configure your environment variables
   npm run dev
   ```

4. **Database Setup**
   ```bash
   # Run the schema migrations
   psql -d your_database -f backend/db/schema.sql
   ```

### Environment Variables

**Backend (.env)**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/crackedonpaper
JWT_SECRET=your-jwt-secret
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=your-bucket-name
AWS_REGION=your-region
```

**Frontend (.env.local)**

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---
