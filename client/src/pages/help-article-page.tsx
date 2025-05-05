import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ChevronLeft, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";

export default function HelpArticlePage() {
  const { slug } = useParams();
  
  // Fetch article by slug
  const { data: article, isLoading, error } = useQuery({
    queryKey: ["/api/help/articles", slug],
    queryFn: async () => {
      if (!slug) return null;
      const res = await apiRequest("GET", `/api/help/articles/${slug}`);
      return res.json();
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/support">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Support
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container py-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/support">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Support
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Article Not Found</CardTitle>
            <CardDescription>
              The article you are looking for does not exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/support">Return to Support Center</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/support">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Support
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{article.category?.name || "Uncategorized"}</Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" /> {formatDate(article.updatedAt, "MMM d, yyyy")}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Eye className="mr-1 h-3 w-3" /> {article.views} views
            </div>
          </div>
          <CardTitle className="text-2xl mt-2">{article.title}</CardTitle>
          <CardDescription>
            Knowledge base article to help you understand our platform
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 prose dark:prose-invert max-w-none">
          <ReactMarkdown>
            {article.content}
          </ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
}