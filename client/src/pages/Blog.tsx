import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Leaf, Loader2, Search } from "lucide-react";
import { ArticleCardSkeleton } from "@/components/ui/article-card-skeleton";

type Article = {
  id: number;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string | null;
  status: string;
  createdAt: string;
};

const BANNER_IMAGE = "/banner-blog.png";

export default function Blog() {
  const [bannerError, setBannerError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ["/api/articles"],
    queryFn: async () => {
      const res = await fetch("/api/articles");
      if (!res.ok) throw new Error("Failed to load articles");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return articles as Article[];
    return (articles as Article[]).filter(
      (a) =>
        a.title?.toLowerCase().includes(q) ||
        (a.content || "").replace(/<[^>]*>/g, "").toLowerCase().includes(q)
    );
  }, [articles, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary/5">
        <div className="container mx-auto px-4 py-12">
          <div className="h-44 sm:h-52 rounded-xl bg-muted/50 animate-pulse mb-10" />
          <div className="flex items-center gap-2 mb-8">
            <Leaf className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-display font-bold text-primary">Blog</h1>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-destructive">Failed to load articles. Please try again later.</p>
      </div>
    );
  }

  const bannerImage = BANNER_IMAGE;

  return (
    <div className="min-h-screen bg-secondary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-xl overflow-hidden mb-10 h-44 sm:h-52 bg-primary/10 relative">
          {!bannerError ? (
            <img
              src={bannerImage}
              alt="Smart Plant Care blog banner"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={() => setBannerError(true)}
            />
          ) : null}
          {bannerError && (
            <img
              src="/smart-plant-care-header.png"
              alt="Smart Plant Care blog banner"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-black/20 flex items-center justify-center rounded-xl">
            <div className="text-center px-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-2 mb-3 border border-white/20">
                <Leaf className="h-5 w-5 text-white/90" />
                <span className="text-white/90 text-sm font-medium tracking-wide uppercase">Blog</span>
              </div>
              <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight drop-shadow-lg [text-shadow:0_2px_8px_rgba(0,0,0,0.5)]">
                Smart Plant Care
              </h2>
              <p className="text-white/95 text-sm sm:text-base mt-2 font-medium tracking-wide [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
                Tips, guides & updates for your green journey
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-display font-bold text-primary">Blog</h1>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <p className="text-muted-foreground mb-10 max-w-2xl">
          Tips, guides, and updates from Smart Plant Care.
        </p>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Leaf className="h-14 w-14 mx-auto text-primary/30 mb-4" />
            <p className="font-medium text-foreground/80">
              {articles.length === 0 ? "No articles yet." : "No articles match your search."}
            </p>
            <p className="text-sm mt-1">We’ll share plant care tips and updates here soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const [imgError, setImgError] = useState(false);
  const showImg = article.imageUrl && !imgError;

  return (
    <Link href={`/blog/${article.id}`}>
      <Card className="group border-2 border-border/60 bg-white shadow-sm hover:border-primary/40 hover:shadow-md transition-all cursor-pointer h-full">
        <CardContent className="p-6">
          {showImg ? (
            <img
              src={article.imageUrl!}
              alt=""
              className="w-full h-40 object-cover rounded-lg mb-4"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-40 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Leaf className="h-12 w-12 text-primary/40" />
            </div>
          )}
          <h2 className="font-display font-semibold text-lg text-primary line-clamp-2">
            {article.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {(article.content || "").replace(/<[^>]*>/g, "").slice(0, 160)}…
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            {new Date(article.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          <span className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-3 group-hover:gap-2 transition-all">
            Read more →
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
