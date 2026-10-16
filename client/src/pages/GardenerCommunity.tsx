import { GardenerLayout } from "@/components/gardener/GardenerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Heart, Share2, Send, Search } from "lucide-react";
import { useState } from "react";

export default function GardenerCommunity() {
  const [searchQuery, setSearchQuery] = useState("");

  // Sample community posts (in real app, this would come from API)
  const posts = [
    {
      id: 1,
      author: "John Smith",
      role: "Expert Gardener",
      avatar: "https://ui-avatars.com/api/?name=John+Smith&background=22c55e&color=fff",
      time: "2 hours ago",
      content: "Just completed a beautiful landscape design for a client in Karachi. Used native plants that thrive in our climate. Anyone else working on similar projects?",
      tags: ["Landscaping", "Native Plants", "Karachi"],
      likes: 12,
      comments: 5,
      liked: false,
    },
    {
      id: 2,
      author: "Sarah Ahmed",
      role: "Plant Specialist",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Ahmed&background=22c55e&color=fff",
      time: "5 hours ago",
      content: "Tip of the day: For indoor plants in Pakistan, make sure to water them early morning or late evening to avoid rapid evaporation. Also, use well-draining soil!",
      tags: ["Tips", "Indoor Plants", "Watering"],
      likes: 28,
      comments: 8,
      liked: true,
    },
    {
      id: 3,
      author: "Ahmed Khan",
      role: "Garden Consultant",
      avatar: "https://ui-avatars.com/api/?name=Ahmed+Khan&background=22c55e&color=fff",
      time: "1 day ago",
      content: "Looking for recommendations on the best fertilizers for vegetable gardens in Pakistan. What has worked best for you all?",
      tags: ["Vegetables", "Fertilizers", "Question"],
      likes: 15,
      comments: 12,
      liked: false,
    },
  ];

  const filteredPosts = posts.filter(
    (post) =>
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <GardenerLayout title="Community" subtitle="Connect with fellow gardeners">
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search posts, tags, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Create Post Card */}
        <Card>
          <CardHeader>
            <CardTitle>Share Your Experience</CardTitle>
            <CardDescription>Post tips, ask questions, or share your gardening journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="What's on your mind? Share tips, ask questions, or showcase your work..."
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Tips: Use tags to reach more gardeners
                </div>
                <Button>
                  <Send className="mr-2 h-4 w-4" />
                  Post
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Posts */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No posts found. Try a different search term.
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      </div>
    </GardenerLayout>
  );
}

function PostCard({ post }: { post: any }) {
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikes((prev: number) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <img
            src={post.avatar}
            alt={post.author}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <div className="font-semibold">{post.author}</div>
            <div className="text-sm text-muted-foreground">{post.role} • {post.time}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed mb-4">{post.content}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-6 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={liked ? "text-primary" : ""}
          >
            <Heart className={`mr-2 h-4 w-4 ${liked ? "fill-current" : ""}`} />
            {likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {post.comments} Comments
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <div className="text-sm text-muted-foreground mb-2">Comments ({post.comments})</div>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-semibold">User1:</span> Great tip! Thanks for sharing.
              </div>
              <div className="text-sm">
                <span className="font-semibold">User2:</span> I'll try this method next time.
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Input placeholder="Add a comment..." className="flex-1" />
              <Button size="sm">Post</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
