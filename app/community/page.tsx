"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Plus,
  Trophy,
  Dumbbell,
  Utensils,
  Settings,
  Search,
  TrendingUp,
  Clock,
  Flame,
  Users,
  Target,
  Medal,
  ThumbsUp,
  Sparkles,
  Send,
  UserPlus,
  UserCheck,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreatePostModal } from "@/app/create-post-modal"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Comment {
  id: number
  user: { name: string; avatar: string }
  content: string
  time: string
  likes: number
}

interface Post {
  id: number
  user: { name: string; avatar: string; isFollowing?: boolean }
  title: string
  content: string
  image?: string
  likes: number
  comments: number
  commentsList?: Comment[]
  time: string
  category: string
  liked?: boolean
  reactions?: {
    heart: number
    celebrate: number
    support: number
    fire: number
  }
  userReaction?: "heart" | "celebrate" | "support" | "fire" | null
}

interface LeaderboardUser {
  name: string
  avatar: string
  posts: number
  likes: number
  rank: number
}

export default function Community() {
  const router = useRouter()
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "trending">("recent")
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showChallenges, setShowChallenges] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [commentText, setCommentText] = useState("")

  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      user: { name: "Sarah J.", avatar: "/placeholder.svg?height=40&width=40", isFollowing: false },
      title: "Hit a new PR today! 💪",
      content: "Finally benched 135lbs for 5 reps! The V-Life program is really working for me.",
      image: "/placeholder.svg?height=300&width=500",
      likes: 24,
      comments: 8,
      commentsList: [
        {
          id: 1,
          user: { name: "Mike T.", avatar: "/placeholder.svg?height=40&width=40" },
          content: "Amazing progress! Keep it up!",
          time: "1h ago",
          likes: 3,
        },
        {
          id: 2,
          user: { name: "Alex K.", avatar: "/placeholder.svg?height=40&width=40" },
          content: "That's incredible! What's your training split?",
          time: "45m ago",
          likes: 2,
        },
      ],
      time: "2h ago",
      category: "achievement",
      reactions: { heart: 15, celebrate: 6, support: 2, fire: 1 },
      userReaction: null,
    },
    {
      id: 2,
      user: { name: "Mike T.", avatar: "/placeholder.svg?height=40&width=40", isFollowing: true },
      title: "Morning run completed ✅",
      content: "5K in 22 minutes. Getting faster every week thanks to the custom cardio plan!",
      image: "/placeholder.svg?height=300&width=500",
      likes: 18,
      comments: 5,
      commentsList: [],
      time: "4h ago",
      category: "workout",
      reactions: { heart: 12, celebrate: 3, support: 2, fire: 1 },
      userReaction: null,
    },
    {
      id: 3,
      user: { name: "Alex K.", avatar: "/placeholder.svg?height=40&width=40", isFollowing: false },
      title: "Meal prep Sunday",
      content: "Prepped all my meals for the week using the V-Life nutrition plan. So convenient!",
      image: "/placeholder.svg?height=300&width=500",
      likes: 32,
      comments: 12,
      commentsList: [],
      time: "8h ago",
      category: "nutrition",
      reactions: { heart: 20, celebrate: 8, support: 3, fire: 1 },
      userReaction: null,
    },
  ])

  const [leaderboard] = useState<LeaderboardUser[]>([
    { name: "Sarah J.", avatar: "/placeholder.svg?height=40&width=40", posts: 45, likes: 892, rank: 1 },
    { name: "Mike T.", avatar: "/placeholder.svg?height=40&width=40", posts: 38, likes: 756, rank: 2 },
    { name: "Alex K.", avatar: "/placeholder.svg?height=40&width=40", posts: 32, likes: 634, rank: 3 },
    { name: "Emma R.", avatar: "/placeholder.svg?height=40&width=40", posts: 28, likes: 521, rank: 4 },
    { name: "Chris P.", avatar: "/placeholder.svg?height=40&width=40", posts: 24, likes: 489, rank: 5 },
  ])

  const [challenges] = useState([
    {
      id: 1,
      title: "30-Day Consistency Challenge",
      description: "Complete 30 workouts in 30 days",
      participants: 156,
      daysLeft: 12,
      progress: 60,
    },
    {
      id: 2,
      title: "10K Steps Daily",
      description: "Hit 10,000 steps every day this week",
      participants: 234,
      daysLeft: 3,
      progress: 85,
    },
    {
      id: 3,
      title: "Protein Goal Master",
      description: "Meet your protein goal for 14 days straight",
      participants: 189,
      daysLeft: 7,
      progress: 50,
    },
  ])

  const currentUser = {
    name: "Alex",
    avatar: "/placeholder.svg?height=40&width=40",
  }

  const categories = [
    { id: "all", name: "All", icon: Users },
    { id: "achievement", name: "Achievements", icon: Trophy },
    { id: "workout", name: "Workouts", icon: Dumbbell },
    { id: "nutrition", name: "Nutrition", icon: Utensils },
  ]

  const filteredAndSortedPosts = posts
    .filter((post) => {
      const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.user.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === "popular") {
        return b.likes - a.likes
      } else if (sortBy === "trending") {
        const aTotal = Object.values(a.reactions || {}).reduce((sum, val) => sum + val, 0)
        const bTotal = Object.values(b.reactions || {}).reduce((sum, val) => sum + val, 0)
        return bTotal - aTotal
      }
      return 0 // recent is default order
    })

  const handleCreatePost = (newPost: {
    title: string
    content: string
    image?: string
    category: string
  }) => {
    const post: Post = {
      id: Date.now(),
      user: { ...currentUser, isFollowing: false },
      title: newPost.title,
      content: newPost.content,
      image: newPost.image,
      likes: 0,
      comments: 0,
      commentsList: [],
      time: "Just now",
      category: newPost.category,
      liked: false,
      reactions: { heart: 0, celebrate: 0, support: 0, fire: 0 },
      userReaction: null,
    }

    setPosts((prevPosts) => [post, ...prevPosts])
  }

  const handleReaction = (postId: number, reactionType: "heart" | "celebrate" | "support" | "fire") => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const reactions = { ...post.reactions }
          const currentReaction = post.userReaction

          // Remove previous reaction
          if (currentReaction && reactions[currentReaction] !== undefined) {
            reactions[currentReaction] = Math.max(0, reactions[currentReaction] - 1)
          }

          // Add new reaction or toggle off
          if (currentReaction === reactionType) {
            return { ...post, reactions, userReaction: null }
          } else {
            reactions[reactionType] = (reactions[reactionType] || 0) + 1
            return { ...post, reactions, userReaction: reactionType }
          }
        }
        return post
      }),
    )
  }

  const toggleFollow = (postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              user: { ...post.user, isFollowing: !post.user.isFollowing },
            }
          : post,
      ),
    )
  }

  const handleAddComment = () => {
    if (!commentText.trim() || !selectedPost) return

    const newComment: Comment = {
      id: Date.now(),
      user: currentUser,
      content: commentText.trim(),
      time: "Just now",
      likes: 0,
    }

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === selectedPost.id
          ? {
              ...post,
              comments: post.comments + 1,
              commentsList: [...(post.commentsList || []), newComment],
            }
          : post,
      ),
    )

    setCommentText("")
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "achievement":
        return <Trophy className="h-3 w-3 text-yellow-400" />
      case "workout":
        return <Dumbbell className="h-3 w-3 text-red-400" />
      case "nutrition":
        return <Utensils className="h-3 w-3 text-green-400" />
      default:
        return null
    }
  }

  const reactionIcons = {
    heart: { icon: Heart, color: "text-red-400", label: "Love" },
    celebrate: { icon: Sparkles, color: "text-yellow-400", label: "Celebrate" },
    support: { icon: ThumbsUp, color: "text-blue-400", label: "Support" },
    fire: { icon: Flame, color: "text-orange-400", label: "Fire" },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-charcoal pb-20">
      <div className="container max-w-md px-4 py-6">
        <motion.div
          className="mb-6 space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Community</h1>
              <p className="text-white/70">Connect with other members</p>
            </div>
            <ButtonGlow variant="outline-glow" size="icon" onClick={() => router.push("/settings")} className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </ButtonGlow>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <Input
              placeholder="Search posts, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <ButtonGlow variant="outline-glow" size="sm" onClick={() => setShowLeaderboard(true)} className="flex-1">
              <Medal className="mr-2 h-4 w-4" />
              Leaderboard
            </ButtonGlow>
            <ButtonGlow variant="outline-glow" size="sm" onClick={() => setShowChallenges(true)} className="flex-1">
              <Target className="mr-2 h-4 w-4" />
              Challenges
            </ButtonGlow>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-black/50">
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                  <cat.icon className="mr-1 h-3 w-3" />
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Sort Options */}
          <div className="flex gap-2">
            <ButtonGlow
              variant={sortBy === "recent" ? "accent-glow" : "outline-glow"}
              size="sm"
              onClick={() => setSortBy("recent")}
            >
              <Clock className="mr-1 h-3 w-3" />
              Recent
            </ButtonGlow>
            <ButtonGlow
              variant={sortBy === "popular" ? "accent-glow" : "outline-glow"}
              size="sm"
              onClick={() => setSortBy("popular")}
            >
              <Heart className="mr-1 h-3 w-3" />
              Popular
            </ButtonGlow>
            <ButtonGlow
              variant={sortBy === "trending" ? "accent-glow" : "outline-glow"}
              size="sm"
              onClick={() => setSortBy("trending")}
            >
              <TrendingUp className="mr-1 h-3 w-3" />
              Trending
            </ButtonGlow>
          </div>
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {filteredAndSortedPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-white/10 bg-black/50 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center flex-1">
                      <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                        <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <h3 className="font-medium text-white mr-2">{post.user.name}</h3>
                          {getCategoryIcon(post.category)}
                        </div>
                        <p className="text-xs text-white/60">{post.time}</p>
                      </div>
                      <ButtonGlow
                        variant={post.user.isFollowing ? "outline-glow" : "accent-glow"}
                        size="sm"
                        onClick={() => toggleFollow(post.id)}
                        className="ml-2"
                      >
                        {post.user.isFollowing ? (
                          <>
                            <UserCheck className="mr-1 h-3 w-3" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-1 h-3 w-3" />
                            Follow
                          </>
                        )}
                      </ButtonGlow>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-full p-1 hover:bg-white/10 ml-2">
                          <MoreVertical className="h-5 w-5 text-white/60" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-black/90 border-white/10">
                        <DropdownMenuItem className="text-white/80">Share Post</DropdownMenuItem>
                        <DropdownMenuItem className="text-white/80">Save Post</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400">Report Post</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="px-4 pb-2">
                    <h2 className="mb-1 font-bold text-white">{post.title}</h2>
                    {post.content && <p className="text-sm text-white/80">{post.content}</p>}
                  </div>

                  {post.image && (
                    <div className="mt-2">
                      <img src={post.image || "/placeholder.svg"} alt="Post content" className="w-full" />
                    </div>
                  )}

                  {/* Reactions Bar */}
                  <div className="px-4 py-2 flex items-center gap-1 border-t border-white/10">
                    {Object.entries(reactionIcons).map(([key, { icon: Icon, color }]) => {
                      const count = post.reactions?.[key as keyof typeof post.reactions] || 0
                      const isActive = post.userReaction === key
                      return (
                        <button
                          key={key}
                          onClick={() => handleReaction(post.id, key as any)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all ${
                            isActive ? `${color} bg-white/10` : "text-white/60 hover:bg-white/5"
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${isActive ? "" : ""}`} />
                          {count > 0 && <span className="text-xs">{count}</span>}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 p-4">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="flex items-center text-white/60 hover:text-accent transition-all"
                      >
                        <MessageCircle className="mr-1 h-5 w-5" />
                        <span className="text-sm">{post.comments}</span>
                      </button>
                    </div>
                    <button className="text-white/60 hover:text-accent">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredAndSortedPosts.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 mx-auto">
              <Search className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No posts found</h3>
            <p className="text-white/70 mb-4">Try adjusting your filters or search query</p>
          </motion.div>
        )}
      </div>

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-md bg-black/95 border-accent/30">
          <DialogHeader>
            <DialogTitle className="text-white">Comments</DialogTitle>
            <DialogDescription className="text-white/70">{selectedPost?.comments || 0} comments</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {selectedPost?.commentsList?.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8 border border-white/10">
                  <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                  <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-white/5 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-white">{comment.user.name}</h4>
                    <p className="text-sm text-white/80 mt-1">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-1 px-3">
                    <span className="text-xs text-white/50">{comment.time}</span>
                    <button className="text-xs text-white/50 hover:text-accent">Like</button>
                    <button className="text-xs text-white/50 hover:text-accent">Reply</button>
                  </div>
                </div>
              </div>
            ))}
            {(!selectedPost?.commentsList || selectedPost.commentsList.length === 0) && (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-white/20 mx-auto mb-2" />
                <p className="text-white/50 text-sm">No comments yet. Be the first!</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-4 border-t border-white/10">
            <Input
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              className="flex-1"
            />
            <ButtonGlow variant="accent-glow" size="icon" onClick={handleAddComment} disabled={!commentText.trim()}>
              <Send className="h-4 w-4" />
            </ButtonGlow>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
        <DialogContent className="max-w-md bg-black/95 border-accent/30">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Medal className="mr-2 h-5 w-5 text-yellow-400" />
              Community Leaderboard
            </DialogTitle>
            <DialogDescription className="text-white/70">Top contributors this month</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {leaderboard.map((user) => (
              <Card key={user.rank} className="border-white/10 bg-black/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 text-accent font-bold">
                    {user.rank}
                  </div>
                  <Avatar className="h-10 w-10 border border-white/10">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{user.name}</h4>
                    <p className="text-xs text-white/60">
                      {user.posts} posts • {user.likes} likes
                    </p>
                  </div>
                  {user.rank <= 3 && (
                    <Trophy
                      className={`h-5 w-5 ${
                        user.rank === 1 ? "text-yellow-400" : user.rank === 2 ? "text-gray-400" : "text-orange-400"
                      }`}
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showChallenges} onOpenChange={setShowChallenges}>
        <DialogContent className="max-w-md bg-black/95 border-accent/30">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Target className="mr-2 h-5 w-5 text-accent" />
              Active Challenges
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Join community challenges and compete with others
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="border-white/10 bg-black/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-white mb-1">{challenge.title}</h4>
                      <p className="text-sm text-white/70">{challenge.description}</p>
                    </div>
                    <Badge variant="outline" className="border-accent/50 text-accent">
                      {challenge.daysLeft}d left
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>{challenge.participants} participants</span>
                      <span>{challenge.progress}% complete</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent to-accent/50 transition-all"
                        style={{ width: `${challenge.progress}%` }}
                      />
                    </div>
                  </div>
                  <ButtonGlow variant="accent-glow" size="sm" className="w-full mt-3">
                    Join Challenge
                  </ButtonGlow>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Create Post Button */}
      <motion.div
        className="fixed bottom-20 right-4 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      >
        <ButtonGlow
          variant="accent-glow"
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setCreatePostModalOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </ButtonGlow>
      </motion.div>

      <CreatePostModal
        isOpen={createPostModalOpen}
        onClose={() => setCreatePostModalOpen(false)}
        onCreatePost={handleCreatePost}
        userName={currentUser.name}
        userAvatar={currentUser.avatar}
      />

      <BottomNav />
    </div>
  )
}
