"use client";
import { Navbar } from "@/components/navbar/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Medal, Trophy, TrendingUp, Users, Filter } from "lucide-react";

export default function LeaderboardsPage() {
  const industries = ["Tech", "Finance", "Marketing", "Design", "Sales"];
  const experienceLevels = ["Entry", "Mid-Level", "Senior", "Executive"];

  const topResumes = [
    {
      id: 1,
      rank: 1,
      elo: 1456,
      battles: 89,
      winRate: 0.78,
      industry: "Tech",
      level: "Senior",
      lastActive: "2h ago",
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
    },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
            <Medal className="w-8 h-8" />
            Leaderboards
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See the top-performing resumes ranked by Elo rating. Filter by
            industry and experience level to find your competition.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Resumes</p>
                  <p className="text-2xl font-bold">2,847</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Battles
                  </p>
                  <p className="text-2xl font-bold">156</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Elo</p>
                  <p className="text-2xl font-bold">1,156</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Top Elo</p>
                  <p className="text-2xl font-bold">1,456</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Industry
                </label>
                <div className="flex flex-wrap gap-2">
                  {industries.map((industry) => (
                    <Button
                      key={industry}
                      variant={industry === "Tech" ? "default" : "outline"}
                      size="sm"
                    >
                      {industry}
                    </Button>
                  ))}
                </div>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Experience Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {experienceLevels.map((level) => (
                    <Button
                      key={level}
                      variant={level === "Senior" ? "default" : "outline"}
                      size="sm"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Top Resumes - Tech • Senior</span>
              <Badge variant="secondary">Updated 2 minutes ago</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topResumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold min-w-[3rem]">
                      {getRankIcon(resume.rank)}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-muted-foreground font-semibold">
                          {resume.elo.toString().slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">
                          Anonymized Resume #{resume.id}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {resume.industry} • {resume.level}
                          </Badge>
                          <span>• {resume.battles} battles</span>
                          <span>
                            • {(resume.winRate * 100).toFixed(0)}% win rate
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {resume.elo}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last active: {resume.lastActive}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Results
          </Button>
        </div>

        <Separator className="my-8" />

        {/* Other Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tech • Mid-Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>#{i} Resume</span>
                    <span className="font-semibold">{1200 - i * 15}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Finance • Senior</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>#{i} Resume</span>
                    <span className="font-semibold">{1350 - i * 20}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Marketing • Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>#{i} Resume</span>
                    <span className="font-semibold">{1100 - i * 10}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
