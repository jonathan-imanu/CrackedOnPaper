"use client";
import { Navbar } from "@/components/navbar/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowUpDown, Vote, FileText, Trophy, Users } from "lucide-react";

export default function H2HPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
            <ArrowUpDown className="w-8 h-8" />
            Resume Battle
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Vote on which resume is more impressive in this head-to-head
            comparison. Both resumes are anonymized and matched by industry and
            experience level.
          </p>
        </div>

        {/* Battle Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Votes</p>
                  <p className="text-2xl font-bold">1,247</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Battles
                  </p>
                  <p className="text-2xl font-bold">23</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Your Votes</p>
                  <p className="text-2xl font-bold">42</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Battle Arena */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Resume A */}
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Resume A</CardTitle>
                <Badge variant="secondary">Tech • Mid-Level</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Anonymized Resume Preview
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PII removed for fairness
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Elo:</span>
                  <span className="font-semibold">1,156</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Battles Won:</span>
                  <span className="font-semibold">23/45</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VS Separator */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <span className="text-primary-foreground font-bold text-xl">
                  VS
                </span>
              </div>
              <p className="text-muted-foreground">Choose the winner</p>
            </div>
          </div>

          {/* Resume B */}
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Resume B</CardTitle>
                <Badge variant="secondary">Tech • Mid-Level</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Anonymized Resume Preview
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PII removed for fairness
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Elo:</span>
                  <span className="font-semibold">1,203</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Battles Won:</span>
                  <span className="font-semibold">31/52</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voting Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
          >
            <Vote className="w-5 h-5 mr-2" />
            Vote for Resume A
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Can&apos;t Decide / Tie
          </Button>
          <Button
            size="lg"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            <Vote className="w-5 h-5 mr-2" />
            Vote for Resume B
          </Button>
        </div>

        {/* Mobile VS indicator */}
        <div className="lg:hidden flex items-center justify-center my-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2">
              <span className="text-primary-foreground font-bold">VS</span>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Recent Battles */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Recent Battles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">Finance • Senior</Badge>
                    <span className="text-xs text-muted-foreground">
                      2h ago
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Resume A (1,245)</span>
                    <span className="font-bold text-green-600">✓</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Resume B (1,198)</span>
                    <span className="text-muted-foreground">✗</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    156 votes • Elo change: +12/-8
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
