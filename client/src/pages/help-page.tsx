import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, BookOpenIcon, ClockIcon, EyeIcon } from "lucide-react";
import { useState } from "react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  
  // Query for help categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/help/categories"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Query for help articles
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["/api/help/articles", activeCategory],
    queryFn: async () => {
      const url = activeCategory 
        ? `/api/help/articles?categoryId=${activeCategory}` 
        : "/api/help/articles";
      const res = await apiRequest("GET", url);
      return res.json();
    }
  });
  
  // Filter articles by search query
  const filteredArticles = Array.isArray(articles) ? articles.filter(article => 
    searchQuery === "" || 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];
  
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Knowledge Base</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with categories */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Browse by topic</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <div className="space-y-1">
                <Button 
                  variant={activeCategory === null ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveCategory(null)}
                >
                  All Articles
                </Button>
                {Array.isArray(categories) && categories.map((category: any) => (
                  <Button 
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Help Articles</CardTitle>
                  <CardDescription>
                    Find answers to common questions
                  </CardDescription>
                </div>
                <div className="relative w-full md:w-64">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search articles..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="text-center py-8">Loading articles...</div>
              ) : filteredArticles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No articles match your search" : "No articles available"}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredArticles.map((article: any) => (
                    <Card key={article.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline">{article.category?.name || "Uncategorized"}</Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <ClockIcon className="mr-1 h-3 w-3" /> {formatDate(article.updatedAt, "MMM d, yyyy")}
                          </div>
                        </div>
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {article.summary || article.content.substring(0, 120) + "..."}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0 flex justify-between items-center">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <EyeIcon className="mr-1 h-3 w-3" /> {article.views} views
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/help/article/${article.slug}`}>
                            Read More
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}