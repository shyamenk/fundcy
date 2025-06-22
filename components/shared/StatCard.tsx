import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: 'positive' | 'negative' | undefined;
}

export const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: StatCardProps) => {
  const getTrendIcon = () => {
    if (trend === 'positive') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'negative') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'positive') return 'text-green-600';
    if (trend === 'negative') return 'text-red-600';
    return '';
  };

  // Check if value contains INR symbol for special styling
  const isINR = value.includes('₹');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getTrendColor()}`}>
          {isINR ? (
            <span className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-foreground">₹</span>
              <span>{value.replace('₹', '')}</span>
            </span>
          ) : (
            value
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};
