import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Leaf, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:id");
  const id = params?.id ? Number(params.id) : null;

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["/api/articles", id],
    queryFn: async () => {
      const res = await fetch(`/api/articles/${id}`);
      if (!res.ok) throw new Error("Article not found");
      return res.json();
    },
    enabled: id != null && !Number.isNaN(id),
  });

  if (id == null || Number.isNaN(id)) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Invalid article.</p>
        <Link href="/blog"><Button variant="outline" className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" />Back to Blog</Button></Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-destructive">Article not found.</p>
        <Link href="/blog"><Button variant="outline" className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" />Back to Blog</Button></Link>
      </div>
    );
  }

  return (
    <BlogPostContent article={article} />
  );
}

function BlogPostContent({ article }: { article: { imageUrl?: string | null; title: string; createdAt: string; content: string } }) {
  const [imgError, setImgError] = useState(false);
  const showImg = article.imageUrl && !imgError;

  return (
    <div className="min-h-screen bg-secondary/5">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Button variant="outline" size="sm" className="mb-8 gap-2" asChild>
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </Button>

        <article>
          {showImg ? (
            <img
              src={article.imageUrl!}
              alt=""
              className="w-full rounded-xl object-cover max-h-80 mb-8"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-48 sm:h-64 rounded-xl bg-primary/10 flex items-center justify-center mb-8">
              <Leaf className="h-16 w-16 text-primary/30" />
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">
            {article.title}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {new Date(article.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          <div className="prose prose-lg prose-green max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
            {article.content || ""}
          </div>
        </article>
      </div>
    </div>
  );
}
