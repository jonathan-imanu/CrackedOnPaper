"use client";
import { Navbar } from "@/components/navbar/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Upload,
  TrendingUp,
  MessageSquare,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Trophy,
  Target,
  Calendar,
} from "lucide-react";

export default function MyResumesPage() {
  const userResumes = [
    {
      id: 1,
      name: "Software Engineer Resume",
      industry: "Tech",
      level: "Mid-Level",
      elo: 1245,
      battles: 23,
      wins: 18,
      winRate: 0.78,
      lastBattle: "2h ago",
      status: "active",
      feedback: 12,
      uploadDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Product Manager Resume",
      industry: "Tech",
      level: "Senior",
      elo: 1187,
      battles: 15,
      wins: 11,
      winRate: 0.73,
      lastBattle: "1d ago",
      status: "active",
      feedback: 8,
      uploadDate: "2024-01-10",
    },
    {
      id: 3,
      name: "Data Scientist Resume",
      industry: "Tech",
      level: "Entry",
      elo: 1056,
      battles: 8,
      wins: 5,
      winRate: 0.63,
      lastBattle: "3d ago",
      status: "paused",
      feedback: 3,
      uploadDate: "2024-01-05",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
              <FileText className="w-8 h-8" />
              My Resumes
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your uploaded resumes and track their performance
            </p>
          </div>
          <Button size="lg" className="mt-4 md:mt-0">
            <Upload className="w-5 h-5 mr-2" />
            Upload New Resume
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Resumes</p>
                  <p className="text-2xl font-bold">{userResumes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Best Elo</p>
                  <p className="text-2xl font-bold">1,245</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Battles</p>
                  <p className="text-2xl font-bold">46</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Feedback
                  </p>
                  <p className="text-2xl font-bold">23</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resume Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {userResumes.map((resume) => (
            <Card key={resume.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      {resume.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{resume.industry}</Badge>
                      <Badge variant="outline">{resume.level}</Badge>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(resume.status)}
                      >
                        {resume.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Resume Preview */}
                <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Resume Preview
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {resume.elo}
                    </div>
                    <div className="text-muted-foreground">Elo Rating</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {(resume.winRate * 100).toFixed(0)}%
                    </div>
                    <div className="text-muted-foreground">Win Rate</div>
                  </div>
                </div>

                {/* Battle Stats */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Battles:</span>
                    <span className="font-semibold">{resume.battles}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wins:</span>
                    <span className="font-semibold text-green-600">
                      {resume.wins}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Feedback:</span>
                    <span className="font-semibold">{resume.feedback}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Battle:</span>
                    <span className="font-semibold">{resume.lastBattle}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    View Feedback
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Performance
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Upload New Card */}
          <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
            <CardContent className="p-8 flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Upload New Resume
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Add another resume to compete in battles
                </p>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {[
              {
                action: "Won battle",
                resume: "Software Engineer",
                opponent: "Resume #847",
                eloChange: "+12",
                time: "2h ago",
              },
              {
                action: "Received feedback",
                resume: "Product Manager",
                feedback: "Great experience section",
                time: "1d ago",
              },
              {
                action: "Lost battle",
                resume: "Data Scientist",
                opponent: "Resume #923",
                eloChange: "-8",
                time: "3d ago",
              },
              {
                action: "Uploaded resume",
                resume: "Software Engineer",
                time: "1 week ago",
              },
            ].map((activity, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {activity.action} - {activity.resume}
                        </p>
                        {activity.opponent && (
                          <p className="text-sm text-muted-foreground">
                            vs {activity.opponent}
                          </p>
                        )}
                        {activity.feedback && (
                          <p className="text-sm text-muted-foreground">
                            "{activity.feedback}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.eloChange && (
                        <span
                          className={`font-semibold ${
                            activity.eloChange.startsWith("+")
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {activity.eloChange}
                        </span>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-16">
                <div className="text-center">
                  <Upload className="w-6 h-6 mx-auto mb-2" />
                  <span>Upload Resume</span>
                </div>
              </Button>
              <Button variant="outline" className="h-16">
                <div className="text-center">
                  <MessageSquare className="w-6 h-6 mx-auto mb-2" />
                  <span>View All Feedback</span>
                </div>
              </Button>
              <Button variant="outline" className="h-16">
                <div className="text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                  <span>Performance Analytics</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
