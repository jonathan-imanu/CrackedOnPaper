# Cracked On Paper

Getting actionable, crowd-sourced feedback on resumes is hard. Discord servers and forums exist, but they lack a structured or engaging way to see how your resume actually stacks up against others.

CrackedOnPaper turns resume reviews into a head-to-head competition. Your resume is matched against another candidate's in a "battle," where users vote on which is more impressive ("cracked").

Resumes are anonymized and paired by industry and years of experience (YOE), ensuring fair matchups. After uploading, you'll unlock access to:

- Candid, community feedback on your resume.
- Head-to-head comparisons that show how you perform against real candidates.
- Statistics and leaderboards so you can track your progress and see where you stand.

## Tech Stack

### Frontend

- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x with CSS Variables
- **UI Components**:
  - [ShadCN/ui](https://ui.shadcn.com/) - Core component library
  - [MagicUI](https://magicui.design/) - Animated components
  - [Radix UI](https://www.radix-ui.com/) - Headless component primitives
- **State Management**: React Hook Form with Zod validation
- **File Handling**: FilePond for drag-and-drop file uploads
- **PDF Processing**: PDF.js for client-side PDF rendering
- **Animations**:
  - Framer Motion for animations
  - GSAP for complex animations
  - Rough Notation for text highlighting
- **Authentication**: Supabase Auth
- **HTTP Client**: Axios
- **Icons**: Lucide React, Tabler Icons
- **Theme**: Next-themes for dark/light mode

### Backend

- **Language**: Go 1.24.5
- **Framework**: Gin for HTTP routing
- **Database**: PostgreSQL with SQLC for type-safe queries
- **Authentication**: JWT tokens
- **File Storage**: AWS S3 (DigitalOcean Spaces)
- **PDF Processing**:
  - go-fitz for PDF to image conversion
  - rsc.io/pdf for PDF parsing
- **Image Processing**:
  - disintegration/imaging for image manipulation
  - chai2010/webp for WebP conversion
- **Logging**: Uber Zap
- **CORS**: gin-contrib/cors
- **Environment**: godotenv for configuration

### Infrastructure

- **Database**: PostgreSQL (Supabase)
- **File Storage**: DigitalOcean Spaces (S3-compatible)
- **CDN**: DigitalOcean CDN for image delivery
- **Containerization**: Docker with multi-stage builds
- **Deployment**: Docker containers

## ToDos

- Download Resume functionality
- H2H Matchmaking
- Deployment on Digital Ocean Droplet
- PKCE Auth Flow

#### Download Resume functionality

Should be a relatively easy. Just a heads up that downloading resumes on the frontend is in a broken state right now. You'll need to edit backend/handlers/resume/handler.go and add code to the buckets to download/get an object. The frontend logic is all in features/resumes with the specifics being in the useResumes hook.

#### H2H Matchmaking

Refer to ProjectContext.md for more info. Those tables aren't perfect though and will need changes. Make sure to create all tables in app schema.
