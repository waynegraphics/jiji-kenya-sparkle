import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight, BookOpen, Search, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const categories = ["All", ...new Set(posts?.map((p) => p.category).filter(Boolean) || [])];

  const filteredPosts = (posts || []).filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageHero
        title="Blog"
        subtitle="Stay updated with the latest tips, guides, and news from APA Bazaar"
        badge="Latest News & Tips"
        badgeIcon={BookOpen}
        breadcrumbLabel="Blog"
      />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat as string)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {filteredPosts.length > 0 && (
                <div className="mb-12">
                  <div className="bg-card rounded-xl overflow-hidden shadow-lg border border-border">
                    <div className="md:flex">
                      <div className="md:w-1/2">
                        <img
                          src={filteredPosts[0].thumbnail_url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop"}
                          alt={filteredPosts[0].title}
                          className="w-full h-full object-cover min-h-[250px]"
                        />
                      </div>
                      <div className="md:w-1/2 p-8 flex flex-col justify-center">
                        {filteredPosts[0].category && <Badge className="w-fit mb-4">{filteredPosts[0].category}</Badge>}
                        <h2 className="text-3xl font-bold mb-4">{filteredPosts[0].title}</h2>
                        <p className="text-muted-foreground mb-6 line-clamp-3">{filteredPosts[0].excerpt}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                          <div className="flex items-center gap-2"><User className="h-4 w-4" /> {filteredPosts[0].author_name}</div>
                          {filteredPosts[0].published_at && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(filteredPosts[0].published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </div>
                          )}
                          {filteredPosts[0].read_time && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {filteredPosts[0].read_time}</span>}
                        </div>
                        <Button asChild>
                          <Link to={`/blog/${filteredPosts[0].slug}`}>Read More <ArrowRight className="h-4 w-4 ml-2" /></Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid */}
              {filteredPosts.length > 1 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.slice(1).map((post) => (
                    <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                      <div className="bg-card rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-all">
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={post.thumbnail_url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop"}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="p-6">
                          {post.category && <Badge className="mb-3">{post.category}</Badge>}
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                            <div className="flex items-center gap-1"><User className="h-3 w-3" /> {post.author_name}</div>
                            {post.published_at && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                            Read More <ArrowRight className="h-4 w-4 ml-1" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No articles found</h2>
                  <p className="text-muted-foreground">Check back later for new posts.</p>
                </div>
              ) : null}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
