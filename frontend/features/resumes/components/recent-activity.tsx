import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export interface Activity {
  id: string;
  action: string;
  resume: string;
  opponent?: string;
  feedback?: string;
  eloChange?: string;
  time: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Recent Activity
      </h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <Card key={activity.id}>
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
  );
}
