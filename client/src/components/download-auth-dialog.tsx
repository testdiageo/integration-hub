import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import {
  Lock,
  Crown,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Download,
  Calendar,
} from "lucide-react";

interface DownloadAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorMessage?: string;
  userTier?: string;
  remaining?: number;
  resetDate?: string;
}

export function DownloadAuthDialog({
  open,
  onOpenChange,
  errorMessage,
  userTier = "free",
  remaining = 0,
  resetDate,
}: DownloadAuthDialogProps) {
  // Determine the type of restriction
  const isFreeUser = userTier === "free";
  const isLimitReached = !isFreeUser && remaining === 0;

  // Get friendly tier names
  const tierNameMap: Record<string, string> = {
    free: "Free",
    "one-time": "One-Time",
    monthly: "Monthly",
    annual: "Annual",
  };

  const currentTierName = tierNameMap[userTier] || "Free";

  // Get upgrade suggestion based on current tier
  const getUpgradeSuggestion = () => {
    if (isFreeUser) {
      return {
        title: "Upgrade to Download Files",
        subtitle: "Start with One-Time Purchase or Monthly Subscription",
        recommendedTier: "Monthly",
        benefits: [
          "10+ downloads per month",
          "Unlimited integration projects",
          "Advanced AI field mapping",
          "Priority email support",
        ],
      };
    }

    if (userTier === "one-time") {
      return {
        title: "Upgrade for More Downloads",
        subtitle: "Get Unlimited Downloads with Monthly or Annual Plan",
        recommendedTier: "Monthly",
        benefits: [
          "10+ downloads per month",
          "Unlimited projects",
          "Priority support",
          "API access",
        ],
      };
    }

    return {
      title: "Download Limit Reached",
      subtitle: `Your ${currentTierName} plan limit has been reached`,
      recommendedTier: "Annual",
      benefits: [
        "Higher download limits",
        "Unlimited projects",
        "Priority support",
        "2 months free on annual plan",
      ],
    };
  };

  const suggestion = getUpgradeSuggestion();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Lock className="h-8 w-8 text-white" />
              </div>
              {isFreeUser && (
                <Sparkles className="h-6 w-6 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
              )}
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            {suggestion.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {suggestion.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Status */}
          <Alert className="bg-muted border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Current Plan</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isFreeUser
                      ? "Free users can preview but not download files"
                      : `You have ${remaining} download${remaining !== 1 ? "s" : ""} remaining`}
                  </p>
                </div>
                <Badge variant="secondary" className="ml-2">
                  {currentTierName}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>

          {/* Reset Date for Paid Users with Limit Reached */}
          {isLimitReached && resetDate && (
            <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <Calendar className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-medium">Downloads Reset:</span>{" "}
                  {resetDate}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Your download limit will reset automatically on this date
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {errorMessage && (
            <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Benefits of Upgrading */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 mb-3">
              <Crown className="h-5 w-5 text-amber-600" />
              <h4 className="font-semibold text-sm">
                Upgrade to {suggestion.recommendedTier}
              </h4>
            </div>
            <ul className="space-y-2">
              {suggestion.benefits.map((benefit, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground flex items-start space-x-2"
                >
                  <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Maybe Later
          </Button>
          <Button
            asChild
            className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
          >
            <Link href="/pricing">
              <Crown className="mr-2 h-4 w-4" />
              View Pricing
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
