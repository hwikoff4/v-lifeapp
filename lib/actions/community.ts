"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { TransformedPost, TransformedComment } from "@/lib/types"

interface PostReaction {
  id: string
  reaction_type: 'heart' | 'celebrate' | 'support' | 'fire'
  user_id: string
}

interface PostWithRelations {
  id: string
  user_id: string
  title: string
  content: string
  image_url: string | null
  category: string
  likes_count: number
  comments_count: number
  created_at: string
  profiles: { id: string; name: string | null } | null
  post_reactions: PostReaction[]
}

export async function getPosts(
  category?: string, 
  sortBy?: "recent" | "popular" | "trending"
): Promise<{ posts?: TransformedPost[]; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  let query = supabase
    .from("posts")
    .select(`
      *,
      profiles:user_id (
        id,
        name
      ),
      post_reactions (
        id,
        reaction_type,
        user_id
      )
    `)
    .order("created_at", { ascending: false })

  if (category && category !== "all") {
    query = query.eq("category", category)
  }

  const { data: posts, error } = await query

  if (error) {
    return { error: error.message }
  }

  // Get follows for current user
  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id)

  const followingIds = new Set(follows?.map((f) => f.following_id) || [])

  // Transform posts
  const transformedPosts: TransformedPost[] = (posts as PostWithRelations[] || []).map((post) => {
    const reactions = {
      heart: 0,
      celebrate: 0,
      support: 0,
      fire: 0,
    }

    let userReaction: 'heart' | 'celebrate' | 'support' | 'fire' | null = null

    post.post_reactions?.forEach((reaction) => {
      const type = reaction.reaction_type
      if (reactions[type] !== undefined) {
        reactions[type]++
      }
      if (reaction.user_id === user.id) {
        userReaction = type
      }
    })

    return {
      id: post.id,
      user: {
        id: post.user_id,
        name: post.profiles?.name || "Unknown User",
        avatar: `/placeholder.svg?height=40&width=40`,
        isFollowing: followingIds.has(post.user_id),
      },
      title: post.title,
      content: post.content,
      image: post.image_url,
      likes: post.likes_count || 0,
      comments: post.comments_count || 0,
      time: getTimeAgo(new Date(post.created_at)),
      category: post.category,
      reactions,
      userReaction,
    }
  })

  // Sort posts based on sortBy parameter
  if (sortBy === "popular") {
    transformedPosts.sort((a, b) => b.likes - a.likes)
  } else if (sortBy === "trending") {
    transformedPosts.sort((a, b) => {
      const aTotal = Object.values(a.reactions).reduce((sum, val) => sum + val, 0)
      const bTotal = Object.values(b.reactions).reduce((sum, val) => sum + val, 0)
      return bTotal - aTotal
    })
  }

  return { posts: transformedPosts }
}

export async function createPost(data: { 
  title: string
  content: string
  image?: string
  category: string 
}): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    title: data.title,
    content: data.content,
    image_url: data.image,
    category: data.category,
    likes_count: 0,
    comments_count: 0,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/community")
  return { success: true }
}

export async function toggleReaction(
  postId: string, 
  reactionType: "heart" | "celebrate" | "support" | "fire"
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if user already reacted to this post
  const { data: existingReaction } = await supabase
    .from("post_reactions")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .single()

  if (existingReaction) {
    // If same reaction, remove it
    if (existingReaction.reaction_type === reactionType) {
      const { error } = await supabase
        .from("post_reactions")
        .delete()
        .eq("id", existingReaction.id)

      if (error) return { error: error.message }
    } else {
      // Update to new reaction
      const { error } = await supabase
        .from("post_reactions")
        .update({ reaction_type: reactionType })
        .eq("id", existingReaction.id)

      if (error) return { error: error.message }
    }
  } else {
    // Create new reaction
    const { error } = await supabase.from("post_reactions").insert({
      post_id: postId,
      user_id: user.id,
      reaction_type: reactionType,
    })

    if (error) return { error: error.message }
  }

  revalidatePath("/community")
  return { success: true }
}

export async function toggleFollow(userId: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if already following
  const { data: existingFollow } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", user.id)
    .eq("following_id", userId)
    .single()

  if (existingFollow) {
    // Unfollow
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("id", existingFollow.id)

    if (error) return { error: error.message }
  } else {
    // Follow
    const { error } = await supabase.from("follows").insert({
      follower_id: user.id,
      following_id: userId,
    })

    if (error) return { error: error.message }
  }

  revalidatePath("/community")
  return { success: true }
}

export async function getComments(postId: string): Promise<{ comments?: TransformedComment[]; error?: string }> {
  const supabase = await createClient()

  const { data: comments, error } = await supabase
    .from("comments")
    .select(`
      *,
      profiles:user_id (
        id,
        name
      )
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true })

  if (error) {
    return { error: error.message }
  }

  const transformedComments: TransformedComment[] = (comments || []).map((comment) => ({
    id: comment.id,
    user: {
      name: comment.profiles?.name || "Unknown User",
      avatar: `/placeholder.svg?height=40&width=40`,
    },
    content: comment.content,
    time: getTimeAgo(new Date(comment.created_at)),
    likes: comment.likes_count || 0,
  }))

  return { comments: transformedComments }
}

export async function createComment(
  postId: string, 
  content: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    content: content.trim(),
    likes_count: 0,
  })

  if (error) {
    return { error: error.message }
  }

  // Update comments count on post
  const { error: updateError } = await supabase.rpc("increment_comments_count", { post_id: postId })

  if (updateError) {
    // Non-critical error, just log it
    console.warn("Failed to increment comments count:", updateError.message)
  }

  revalidatePath("/community")
  return { success: true }
}

interface LeaderboardUser {
  name: string
  avatar: string
  posts: number
  likes: number
  rank: number
}

export async function getLeaderboard(): Promise<{ leaderboard?: LeaderboardUser[]; error?: string }> {
  const supabase = await createClient()

  // Get top users by post count and likes
  const { data: users, error } = await supabase
    .from("profiles")
    .select(`
      id,
      name,
      posts:posts(count),
      post_reactions:posts(post_reactions(count))
    `)
    .limit(10)

  if (error) {
    return { error: error.message }
  }

  interface UserWithCounts {
    id: string
    name: string | null
    posts: { count: number }[]
    post_reactions: { post_reactions: { count: number }[] }[]
  }

  // Transform and sort by engagement
  const leaderboard: LeaderboardUser[] = (users as UserWithCounts[] || [])
    .map((user) => ({
      name: user.name || "Unknown User",
      avatar: `/placeholder.svg?height=40&width=40`,
      posts: user.posts?.[0]?.count || 0,
      likes: user.post_reactions?.reduce(
        (sum, post) => sum + (post.post_reactions?.[0]?.count || 0),
        0
      ) || 0,
      rank: 0,
    }))
    .sort((a, b) => b.likes + b.posts * 10 - (a.likes + a.posts * 10))
    .map((user, index) => ({ ...user, rank: index + 1 }))
    .slice(0, 5)

  return { leaderboard }
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "Just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return `${Math.floor(seconds / 604800)}w ago`
}
