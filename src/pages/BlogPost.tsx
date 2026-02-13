import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User, ArrowLeft, Clock, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

interface FAQ {
  question: string;
  answer: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Increment views
  useEffect(() => {
    if (post?.id) {
      supabase.from("blog_posts").update({ views: (post.views || 0) + 1 }).eq("id", post.id).then(() => {});
    }
  }, [post?.id]);

  const faqs: FAQ[] = Array.isArray(post?.faqs) ? (post.faqs as unknown as FAQ[]) : [];

  // SEO meta
  useEffect(() => {
    if (post) {
      document.title = post.title + " | APA Bazaar Blog";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", post.meta_description || post.excerpt || "");
    }
    return () => { document.title = "APA Bazaar"; };
  }, [post]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : !post ? (
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
              <p className="text-muted-foreground mb-4">This blog post doesn't exist or has been removed.</p>
              <Button asChild><Link to="/blog">Back to Blog</Link></Button>
            </div>
          ) : (
            <article>
              {post.category && <Badge className="mb-4">{post.category}</Badge>}
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1"><User className="h-4 w-4" /> {post.author_name}</div>
                {post.published_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                )}
                {post.read_time && (
                  <div className="flex items-center gap-1"><Clock className="h-4 w-4" /> {post.read_time}</div>
                )}
              </div>

              {post.thumbnail_url && (
                <img
                  src={post.thumbnail_url}
                  alt={post.title}
                  className="w-full rounded-xl mb-8 max-h-[400px] object-cover"
                />
              )}

              {/* Keywords */}
              {post.keywords && post.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.keywords.map((kw: string, i: number) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                      <Tag className="h-3 w-3" /> {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Content */}
              <div
                className="prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* FAQs */}
              {faqs.length > 0 && (
                <div className="mt-12 border-t pt-8">
                  <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-3">
                    {faqs.map((faq, i) => (
                      <div key={i} className="border rounded-lg">
                        <button
                          className="w-full flex items-center justify-between p-4 text-left font-medium"
                          onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        >
                          {faq.question}
                          {openFaq === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {openFaq === i && (
                          <div className="px-4 pb-4 text-muted-foreground">{faq.answer}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
