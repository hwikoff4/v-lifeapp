"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { motion } from "framer-motion"
import { Send, Loader2, Bot, UserIcon } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { cn } from "@/lib/utils"

export default function VBotPage() {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log("[v0] VBot page mounted")
    return () => {
      console.log("[v0] VBot page unmounting")
    }
  }, [])

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/vbot" }),
  })

  useEffect(() => {
    if (error) {
      console.log("[v0] VBot chat error:", error)
    }
  }, [error])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const isLoading = status === "streaming" || status === "submitted"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    console.log("[v0] Sending message:", input)
    sendMessage({ text: input })
    setInput("")
  }

  console.log("[v0] VBot render - messages count:", messages.length, "status:", status)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-black to-charcoal pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-black/90 backdrop-blur-lg">
        <div className="container mx-auto max-w-md px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
              <Bot className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">VBot</h1>
              <p className="text-xs text-white/60">Your AI Fitness Coach</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="container mx-auto max-w-md flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <motion.div
            className="flex h-full flex-col items-center justify-center text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent/20">
              <Bot className="h-10 w-10 text-accent" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Hi! I'm VBot</h2>
            <p className="mb-6 max-w-sm text-white/70">
              I know everything about your fitness journey. Ask me about your workouts, nutrition, habits, progress, or
              get personalized advice!
            </p>
            <div className="space-y-2">
              <Card
                className="cursor-pointer border-white/10 bg-black/50 backdrop-blur-sm transition-all hover:scale-[1.02]"
                onClick={() => {
                  setInput("How am I doing with my fitness goals?")
                }}
              >
                <CardContent className="p-3">
                  <p className="text-sm text-white/80">How am I doing with my fitness goals?</p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer border-white/10 bg-black/50 backdrop-blur-sm transition-all hover:scale-[1.02]"
                onClick={() => {
                  setInput("What should I focus on this week?")
                }}
              >
                <CardContent className="p-3">
                  <p className="text-sm text-white/80">What should I focus on this week?</p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer border-white/10 bg-black/50 backdrop-blur-sm transition-all hover:scale-[1.02]"
                onClick={() => {
                  setInput("Give me motivation based on my progress")
                }}
              >
                <CardContent className="p-3">
                  <p className="text-sm text-white/80">Give me motivation based on my progress</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent">
                    <Bot className="h-5 w-5 text-black" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-accent text-black"
                      : "border border-white/10 bg-black/50 text-white backdrop-blur-sm",
                  )}
                >
                  {message.parts.map((part, partIndex) => {
                    if (part.type === "text") {
                      if (message.role === "assistant") {
                        return (
                          <div 
                            key={partIndex}
                            className="prose prose-invert prose-sm max-w-none leading-relaxed [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:mb-2 [&_p]:last:mb-0 [&_strong]:font-bold [&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-4"
                          >
                            <ReactMarkdown>
                              {part.text}
                            </ReactMarkdown>
                          </div>
                        )
                      }
                      return (
                        <p key={partIndex} className="whitespace-pre-wrap text-sm leading-relaxed">
                          {part.text}
                        </p>
                      )
                    }
                    return null
                  })}
                </div>
                {message.role === "user" && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
            {isLoading && (
              <motion.div className="flex gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent">
                  <Bot className="h-5 w-5 text-black" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 backdrop-blur-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  <span className="text-sm text-white/70">Thinking...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-16 border-b border-white/10 bg-black/90 backdrop-blur-lg">
        <div className="container mx-auto max-w-md px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your fitness..."
              className="flex-1 rounded-full border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              disabled={isLoading}
            />
            <ButtonGlow
              type="submit"
              variant="accent-glow"
              size="icon"
              className="h-12 w-12 flex-shrink-0 rounded-full"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </ButtonGlow>
          </form>
          {error && <p className="mt-2 text-xs text-red-500">Error: {error.message}</p>}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
