import { Recommendation } from "@/types";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface RecommendationsProps {
  recommendations: Recommendation[];
}

export function Recommendations({ recommendations }: RecommendationsProps) {
  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Recommendations</h3>
        <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full">AI-Powered</span>
      </div>
      
      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <div key={recommendation.id} className="recommendation-card">
            <div className="flex">
              <div className={cn(
                "recommendation-icon",
                recommendation.iconBgColor,
                recommendation.iconColor
              )}>
                <i className={recommendation.icon}></i>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium">{recommendation.title}</h4>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                  {recommendation.description}
                </p>
                <div className="mt-2">
                  <a 
                    href={recommendation.learnMoreUrl} 
                    className="text-xs text-primary font-medium hover:text-primary-dark cursor-pointer"
                  >
                    Learn more →
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
