import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, MessageSquare, TrendingUp } from "lucide-react";

interface QuickActionsProps {
  onUpload: () => void;
  onViewFeedback: () => void;
  onViewAnalytics: () => void;
}

export function QuickActions({
  onUpload,
  onViewFeedback,
  onViewAnalytics,
}: QuickActionsProps) {
  const actions = [
    {
      icon: Upload,
      label: "Upload Resume",
      onClick: onUpload,
    },
    {
      icon: MessageSquare,
      label: "View All Feedback",
      onClick: onViewFeedback,
    },
    {
      icon: TrendingUp,
      label: "Performance Analytics",
      onClick: onViewAnalytics,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-16"
              onClick={action.onClick}
            >
              <div className="text-center">
                <action.icon className="w-6 h-6 mx-auto mb-2" />
                <span>{action.label}</span>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
