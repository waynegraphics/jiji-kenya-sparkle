import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight, BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  image: string;
  readTime: string;
}

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Sample blog posts - in a real app, these would come from a database
  const blogPosts: BlogPost[] = [
    {
      id: "1",
      title: "10 Tips for Selling Your Items Faster on APA Bazaar",
      excerpt: "Learn proven strategies to make your listings stand out and attract more buyers. From photography tips to pricing strategies, we cover everything you need to know.",
      author: "APA Bazaar Team",
      date: "2024-01-15",
      category: "Selling Tips",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
      readTime: "5 min read",
    },
    {
      id: "2",
      title: "How to Spot Scams: A Buyer's Guide",
      excerpt: "Stay safe while shopping online. We share red flags to watch for and best practices to protect yourself from fraudulent listings.",
      author: "Safety Team",
      date: "2024-01-10",
      category: "Safety",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop",
      readTime: "7 min read",
    },
    {
      id: "3",
      title: "The Ultimate Guide to Buying Used Electronics",
      excerpt: "Everything you need to know before purchasing pre-owned electronics. Learn how to inspect items, verify authenticity, and get the best deals.",
      author: "Tech Expert",
      date: "2024-01-05",
      category: "Buying Guide",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=400&fit=crop",
      readTime: "8 min read",
    },
    {
      id: "4",
      title: "Maximizing Your Seller Profile: Best Practices",
      excerpt: "Build trust and credibility with buyers. Discover how to create an appealing seller profile that attracts more customers and increases sales.",
      author: "Seller Success",
      date: "2023-12-28",
      category: "Selling Tips",
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=400&fit=crop",
      readTime: "6 min read",
    },
    {
      id: "5",
      title: "Understanding Premium Features: Is It Worth It?",
      excerpt: "A comprehensive breakdown of APA Bazaar's premium features and how they can help boost your listings' visibility and sales.",
      author: "Product Team",
      date: "2023-12-20",
      category: "Features",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
      readTime: "4 min read",
    },
    {
      id: "6",
      title: "Marketplace Trends: What's Selling in Kenya",
      excerpt: "Explore the latest trends in Kenya's online marketplace. Discover which categories are hot and what buyers are looking for.",
      author: "Market Research",
      date: "2023-12-15",
      category: "Market Trends",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop",
      readTime: "6 min read",
    },
  ];

  const categories = ["All", "Selling Tips", "Buying Guide", "Safety", "Features", "Market Trends"];

  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
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
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <BookOpen className="h-4 w-4" />
              Blog & Resources
            </div>
            <h1 className="text-4xl font-bold mb-4">APA Bazaar Blog</h1>
            <p className="text-xl text-muted-foreground">
              Tips, guides, and insights to help you buy and sell smarter
            </p>
          </div>

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
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Post */}
          {filteredPosts.length > 0 && (
            <div className="mb-12">
              <div className="bg-card rounded-xl overflow-hidden shadow-lg border border-border">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <img
                      src={filteredPosts[0].image}
                      alt={filteredPosts[0].title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="md:w-1/2 p-8 flex flex-col justify-center">
                    <Badge className="w-fit mb-4">{filteredPosts[0].category}</Badge>
                    <h2 className="text-3xl font-bold mb-4">{filteredPosts[0].title}</h2>
                    <p className="text-muted-foreground mb-6">{filteredPosts[0].excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {filteredPosts[0].author}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(filteredPosts[0].date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <span>{filteredPosts[0].readTime}</span>
                    </div>
                    <Button asChild>
                      <Link to={`/blog/${filteredPosts[0].id}`}>
                        Read More <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Blog Posts Grid */}
          {filteredPosts.length > 1 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.slice(1).map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="group"
                >
                  <div className="bg-card rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-all">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-6">
                      <Badge className="mb-3">{post.category}</Badge>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
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
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : null}

          {/* Newsletter Signup */}
          <div className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-6">
              Get the latest tips, guides, and marketplace insights delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
              />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
