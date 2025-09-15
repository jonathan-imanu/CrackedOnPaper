export interface ResumeData {
  id: number;
  rank: number;
  elo: number;
  battles: number;
  winRate: number;
  industry: string;
  level: string;
  lastActive: string;
  skills: string[];
  experience: string;
  education: string;
  achievements: string[];
  resumeName: string;
  imageKeyPrefix: string;
  cdnUrl: string;
}

export const mockResumeData: ResumeData[] = [
  {
    id: 1,
    rank: 1,
    elo: 1456,
    battles: 89,
    winRate: 0.78,
    industry: "Tech",
    level: "Senior",
    lastActive: "2h ago",
    skills: [
      "React",
      "TypeScript",
      "Node.js",
      "AWS",
      "Docker",
      "Kubernetes",
      "GraphQL",
      "PostgreSQL",
    ],
    experience:
      "5+ years building scalable web applications at top tech companies. Led development of microservices architecture serving 10M+ users.",
    education: "BS Computer Science, Stanford University",
    achievements: [
      "Led team of 8 developers to deliver major product feature ahead of schedule",
      "Reduced API response time by 60% through optimization",
      "Mentored 15+ junior developers",
      "Speaker at ReactConf 2023",
    ],
    resumeName: "Senior Software Engineer",
    imageKeyPrefix:
      "/users/e6939a72-b061-4209-9072-827c9347e91b/resumes/f8c2a03a-6111-4fcc-89f9-8baf629438f0/mcresumeswe.pdf",
    cdnUrl: "https://crackedonpaperwebp.sfo3.cdn.digitaloceanspaces.com",
  },
  {
    id: 2,
    rank: 2,
    elo: 1423,
    battles: 76,
    winRate: 0.82,
    industry: "Tech",
    level: "Senior",
    lastActive: "1d ago",
    skills: [
      "Python",
      "Machine Learning",
      "TensorFlow",
      "PyTorch",
      "SQL",
      "Apache Spark",
      "Docker",
      "Kubernetes",
    ],
    experience:
      "6+ years in data science and machine learning. Built recommendation systems and predictive models for e-commerce platforms.",
    education: "MS Data Science, MIT",
    achievements: [
      "Developed ML model that increased conversion rate by 25%",
      "Published 3 papers in top-tier conferences",
      "Led data science team of 12 people",
      "Patent holder for recommendation algorithm",
    ],
    resumeName: "Senior Data Scientist",
    imageKeyPrefix:
      "/users/e6939a72-b061-4209-9072-827c9347e91b/resumes/f8c2a03a-6111-4fcc-89f9-8baf629438f0/mcresumeswe.pdf",
    cdnUrl: "https://crackedonpaperwebp.sfo3.cdn.digitaloceanspaces.com",
  },
  {
    id: 3,
    rank: 3,
    elo: 1398,
    battles: 92,
    winRate: 0.71,
    industry: "Tech",
    level: "Senior",
    lastActive: "3h ago",
    skills: [
      "Java",
      "Spring Boot",
      "Microservices",
      "Kafka",
      "Redis",
      "MongoDB",
      "Kubernetes",
      "Jenkins",
    ],
    experience:
      "7+ years in backend development with focus on distributed systems and high-performance applications.",
    education: "BS Software Engineering, UC Berkeley",
    achievements: [
      "Architected system handling 1M+ requests per second",
      "Reduced deployment time from 2 hours to 15 minutes",
      "Led migration from monolith to microservices",
      "Open source contributor to Spring Framework",
    ],
    resumeName: "Senior Backend Engineer",
    imageKeyPrefix:
      "/users/e6939a72-b061-4209-9072-827c9347e91b/resumes/f8c2a03a-6111-4fcc-89f9-8baf629438f0/mcresumeswe.pdf",
    cdnUrl: "https://crackedonpaperwebp.sfo3.cdn.digitaloceanspaces.com",
  },
  {
    id: 4,
    rank: 4,
    elo: 1376,
    battles: 65,
    winRate: 0.75,
    industry: "Tech",
    level: "Senior",
    lastActive: "5h ago",
    skills: [
      "Vue.js",
      "JavaScript",
      "CSS3",
      "Webpack",
      "Jest",
      "Cypress",
      "Figma",
      "Storybook",
    ],
    experience:
      "4+ years in frontend development with expertise in modern JavaScript frameworks and design systems.",
    education: "BS Web Development, University of Washington",
    achievements: [
      "Built design system used by 50+ developers",
      "Improved page load speed by 40%",
      "Led accessibility initiative achieving WCAG 2.1 AA compliance",
      "Speaker at Vue.js Global Summit",
    ],
    resumeName: "Senior Frontend Engineer",
    imageKeyPrefix:
      "/users/e6939a72-b061-4209-9072-827c9347e91b/resumes/f8c2a03a-6111-4fcc-89f9-8baf629438f0/mcresumeswe.pdf",
    cdnUrl: "https://crackedonpaperwebp.sfo3.cdn.digitaloceanspaces.com",
  },
  {
    id: 5,
    rank: 5,
    elo: 1354,
    battles: 78,
    winRate: 0.69,
    industry: "Tech",
    level: "Senior",
    lastActive: "1d ago",
    skills: [
      "Go",
      "Rust",
      "C++",
      "Linux",
      "Networking",
      "Security",
      "Docker",
      "Terraform",
    ],
    experience:
      "8+ years in systems programming and infrastructure. Specialized in building high-performance, secure applications.",
    education: "BS Computer Engineering, Carnegie Mellon",
    achievements: [
      "Built networking stack processing 10Gbps traffic",
      "Discovered and patched critical security vulnerabilities",
      "Led infrastructure team managing 1000+ servers",
      "Contributor to Linux kernel",
    ],
    resumeName: "Senior Systems Engineer",
    imageKeyPrefix:
      "/users/e6939a72-b061-4209-9072-827c9347e91b/resumes/f8c2a03a-6111-4fcc-89f9-8baf629438f0/mcresumeswe.pdf",
    cdnUrl: "https://crackedonpaperwebp.sfo3.cdn.digitaloceanspaces.com",
  },
  {
    id: 6,
    rank: 6,
    elo: 1321,
    battles: 83,
    winRate: 0.73,
    industry: "Tech",
    level: "Senior",
    lastActive: "4h ago",
    skills: [
      "Swift",
      "iOS",
      "Objective-C",
      "Core Data",
      "Firebase",
      "Git",
      "Xcode",
      "TestFlight",
    ],
    experience:
      "5+ years in iOS development. Built and maintained apps with millions of downloads on the App Store.",
    education: "BS Computer Science, University of Michigan",
    achievements: [
      "Developed app with 5M+ downloads",
      "Achieved 4.8+ star rating consistently",
      "Led iOS team of 6 developers",
      "Speaker at WWDC 2023",
    ],
    resumeName: "Senior iOS Engineer",
    imageKeyPrefix:
      "/users/e6939a72-b061-4209-9072-827c9347e91b/resumes/f8c2a03a-6111-4fcc-89f9-8baf629438f0/mcresumeswe.pdf",
    cdnUrl: "https://crackedonpaperwebp.sfo3.cdn.digitaloceanspaces.com",
  },
  {
    id: 7,
    rank: 7,
    elo: 1298,
    battles: 71,
    winRate: 0.68,
    industry: "Tech",
    level: "Senior",
    lastActive: "6h ago",
    skills: [
      "C#",
      ".NET",
      "ASP.NET Core",
      "Entity Framework",
      "Azure",
      "SQL Server",
      "Blazor",
      "SignalR",
    ],
    experience:
      "6+ years in .NET development. Specialized in enterprise applications and cloud-native solutions.",
    education: "BS Information Technology, Georgia Tech",
    achievements: [
      "Migrated legacy system to .NET Core",
      "Reduced database query time by 70%",
      "Led team of 10 .NET developers",
      "Microsoft MVP for 3 consecutive years",
    ],
    resumeName: "Senior .NET Engineer",
    imageKeyPrefix:
      "/users/e6939a72-b061-4209-9072-827c9347e91b/resumes/f8c2a03a-6111-4fcc-89f9-8baf629438f0/mcresumeswe.pdf",
    cdnUrl: "https://crackedonpaperwebp.sfo3.cdn.digitaloceanspaces.com",
  },
  {
    id: 8,
    rank: 8,
    elo: 1276,
    battles: 67,
    winRate: 0.72,
    industry: "Tech",
    level: "Senior",
    lastActive: "2d ago",
    skills: [
      "PHP",
      "Laravel",
      "WordPress",
      "MySQL",
      "Redis",
      "Nginx",
      "Docker",
      "AWS",
    ],
    experience:
      "7+ years in PHP development. Built scalable web applications and content management systems.",
    education: "BS Web Development, Arizona State University",
    achievements: [
      "Built CMS serving 100+ websites",
      "Optimized database reducing load time by 50%",
      "Led PHP development team of 8",
      "WordPress plugin with 10K+ active installations",
    ],
    resumeName: "Senior PHP Engineer",
    imageKeyPrefix:
      "/users/e6939a72-b061-4209-9072-827c9347e91b/resumes/f8c2a03a-6111-4fcc-89f9-8baf629438f0/mcresumeswe.pdf",
    cdnUrl: "https://crackedonpaperwebp.sfo3.cdn.digitaloceanspaces.com",
  },
];

export const getFilteredData = (
  industry?: string,
  level?: string
): ResumeData[] => {
  let filtered = mockResumeData;

  if (industry && industry !== "All") {
    filtered = filtered.filter((resume) => resume.industry === industry);
  }

  if (level && level !== "All") {
    filtered = filtered.filter((resume) => resume.level === level);
  }

  return filtered.sort((a, b) => b.elo - a.elo);
};
