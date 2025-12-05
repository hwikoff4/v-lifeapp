"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Check, Plus, Trash2, ShoppingCart } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface GroceryItem {
  id: string
  item_name: string
  category: string | null
  quantity: string | null
  checked: boolean
}

interface GroceryListClientProps {
  items: GroceryItem[]
}

const categories = ["Proteins", "Carbohydrates", "Vegetables", "Fruits", "Healthy Fats", "Pantry Items"]

export function GroceryListClient({ items }: GroceryListClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [groceryItems, setGroceryItems] = useState(items)
  const [newItem, setNewItem] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [isSaving, setIsSaving] = useState(false)

  const completedItems = groceryItems.filter((item) => item.checked).length
  const totalItems = groceryItems.length
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  const getItemsByCategory = (category: string) => {
    return groceryItems.filter((item) => item.category === category)
  }

  const handleToggle = async (item: GroceryItem) => {
    setGroceryItems((prev) =>
      prev.map((entry) => (entry.id === item.id ? { ...entry, checked: !entry.checked } : entry)),
    )
    const { toggleGroceryItem } = await import("@/lib/actions/grocery")
    const result = await toggleGroceryItem(item.id, !item.checked)
    if (!result.success) {
      toast({
        title: "Unable to update item",
        description: result.error || "Please try again.",
        variant: "destructive",
      })
      setGroceryItems((prev) =>
        prev.map((entry) => (entry.id === item.id ? { ...entry, checked: item.checked } : entry)),
      )
    } else {
      router.refresh()
    }
  }

  const handleAddItem = async () => {
    if (!newItem.trim()) return
    setIsSaving(true)
    const { addGroceryItem } = await import("@/lib/actions/grocery")
    const result = await addGroceryItem(newItem.trim(), selectedCategory)
    setIsSaving(false)
    if (!result.success) {
      toast({
        title: "Unable to add item",
        description: result.error || "Please try again.",
        variant: "destructive",
      })
      return
    }
    setNewItem("")
    router.refresh()
  }

  const handleRemoveItem = async (itemId: string) => {
    const { removeGroceryItem } = await import("@/lib/actions/grocery")
    const result = await removeGroceryItem(itemId)
    if (!result.success) {
      toast({
        title: "Unable to remove item",
        description: result.error || "Please try again.",
        variant: "destructive",
      })
      return
    }
    router.refresh()
  }

  const handleClearCompleted = async () => {
    const { clearCompletedItems } = await import("@/lib/actions/grocery")
    const result = await clearCompletedItems()
    if (!result.success) {
      toast({
        title: "Unable to clear items",
        description: result.error || "Please try again.",
        variant: "destructive",
      })
      return
    }
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-charcoal pb-20">
      <div className="container max-w-md px-4 py-6">
        <div className="mb-6 flex items-center">
          <button onClick={() => router.back()} className="mr-4 rounded-full p-2 hover:bg-white/10">
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Grocery List</h1>
            <p className="text-white/70">Based on your meal plan</p>
          </div>
          <ShoppingCart className="h-6 w-6 text-accent" />
        </div>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-white/10 bg-black/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Shopping Progress</h2>
                <span className="text-accent font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="mb-2 h-2 w-full rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-white/70">
                {completedItems} of {totalItems} items completed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-white/10 bg-black/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <h3 className="mb-3 font-bold text-white">Add Custom Item</h3>
              <div className="mb-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mb-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Enter item name..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddItem()
                    }
                  }}
                />
                <ButtonGlow
                  variant="accent-glow"
                  size="icon"
                  onClick={handleAddItem}
                  disabled={!newItem.trim() || isSaving}
                >
                  <Plus className="h-4 w-4" />
                </ButtonGlow>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {categories.map((category) => {
            const categoryItems = getItemsByCategory(category)
            if (categoryItems.length === 0) return null

            return (
              <Card key={category} className="border-white/10 bg-black/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <h3 className="mb-3 text-lg font-bold text-accent">{category}</h3>
                  <div className="space-y-2">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between rounded-lg p-3 transition-all ${
                          item.checked ? "bg-accent/10" : "bg-black/30"
                        }`}
                      >
                        <div className="flex items-center">
                          <button
                            onClick={() => handleToggle(item)}
                            className={`mr-3 flex h-6 w-6 items-center justify-center rounded-full border ${
                              item.checked
                                ? "border-accent bg-accent text-black"
                                : "border-white/30 text-white/60"
                            }`}
                          >
                            {item.checked && <Check className="h-4 w-4" />}
                          </button>
                          <div>
                            <p className={`font-medium ${item.checked ? "text-accent" : "text-white"}`}>
                              {item.item_name}
                            </p>
                            <p className="text-xs text-white/60">{item.quantity || "Quantity as needed"}</p>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveItem(item.id)} className="text-white/50 hover:text-white">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </motion.div>

        <ButtonGlow
          variant="outline-glow"
          className="mt-6 w-full"
          onClick={handleClearCompleted}
          disabled={completedItems === 0}
        >
          Clear Purchased Items
        </ButtonGlow>
      </div>

      <BottomNav />
    </div>
  )
}

