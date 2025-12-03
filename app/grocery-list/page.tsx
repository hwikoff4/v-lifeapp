"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Check, Plus, Trash2, ShoppingCart } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface GroceryItem {
  id: string
  name: string
  category: string
  checked: boolean
  quantity?: string
}

const initialGroceryList: GroceryItem[] = [
  // Proteins
  { id: "1", name: "Chicken Breast", category: "Proteins", checked: false, quantity: "2 lbs" },
  { id: "2", name: "Salmon Fillets", category: "Proteins", checked: false, quantity: "1 lb" },
  { id: "3", name: "Greek Yogurt", category: "Proteins", checked: false, quantity: "32 oz" },
  { id: "4", name: "Eggs", category: "Proteins", checked: false, quantity: "1 dozen" },
  { id: "5", name: "Protein Powder", category: "Proteins", checked: false, quantity: "1 container" },

  // Carbohydrates
  { id: "6", name: "Oats", category: "Carbohydrates", checked: false, quantity: "1 container" },
  { id: "7", name: "Brown Rice", category: "Carbohydrates", checked: false, quantity: "2 lbs" },
  { id: "8", name: "Sweet Potatoes", category: "Carbohydrates", checked: false, quantity: "3 lbs" },
  { id: "9", name: "Quinoa", category: "Carbohydrates", checked: false, quantity: "1 lb" },

  // Vegetables
  { id: "10", name: "Broccoli", category: "Vegetables", checked: false, quantity: "2 heads" },
  { id: "11", name: "Spinach", category: "Vegetables", checked: false, quantity: "1 bag" },
  { id: "12", name: "Bell Peppers", category: "Vegetables", checked: false, quantity: "4 pieces" },
  { id: "13", name: "Carrots", category: "Vegetables", checked: false, quantity: "2 lbs" },
  { id: "14", name: "Cucumber", category: "Vegetables", checked: false, quantity: "2 pieces" },

  // Fruits
  { id: "15", name: "Blueberries", category: "Fruits", checked: false, quantity: "1 container" },
  { id: "16", name: "Bananas", category: "Fruits", checked: false, quantity: "6 pieces" },
  { id: "17", name: "Apples", category: "Fruits", checked: false, quantity: "6 pieces" },
  { id: "18", name: "Avocados", category: "Fruits", checked: false, quantity: "4 pieces" },

  // Healthy Fats
  { id: "19", name: "Olive Oil", category: "Healthy Fats", checked: false, quantity: "1 bottle" },
  { id: "20", name: "Almonds", category: "Healthy Fats", checked: false, quantity: "1 bag" },
  { id: "21", name: "Chia Seeds", category: "Healthy Fats", checked: false, quantity: "1 bag" },

  // Pantry Items
  { id: "22", name: "Coconut Milk", category: "Pantry Items", checked: false, quantity: "2 cans" },
  { id: "23", name: "Black Beans", category: "Pantry Items", checked: false, quantity: "2 cans" },
  { id: "24", name: "Whole Grain Bread", category: "Pantry Items", checked: false, quantity: "1 loaf" },
]

export default function GroceryList() {
  const router = useRouter()
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(initialGroceryList)
  const [newItem, setNewItem] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Proteins")

  const categories = ["Proteins", "Carbohydrates", "Vegetables", "Fruits", "Healthy Fats", "Pantry Items"]

  const toggleItem = (id: string) => {
    setGroceryItems((items) => items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)))
  }

  const addItem = () => {
    if (newItem.trim()) {
      const newGroceryItem: GroceryItem = {
        id: Date.now().toString(),
        name: newItem.trim(),
        category: selectedCategory,
        checked: false,
      }
      setGroceryItems((items) => [...items, newGroceryItem])
      setNewItem("")
    }
  }

  const removeItem = (id: string) => {
    setGroceryItems((items) => items.filter((item) => item.id !== id))
  }

  const clearCompleted = () => {
    setGroceryItems((items) => items.filter((item) => !item.checked))
  }

  const getItemsByCategory = (category: string) => {
    return groceryItems.filter((item) => item.category === category)
  }

  const completedItems = groceryItems.filter((item) => item.checked).length
  const totalItems = groceryItems.length
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

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

        {/* Progress Card */}
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

        {/* Add Item Section */}
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
                  onKeyPress={(e) => e.key === "Enter" && addItem()}
                />
                <ButtonGlow variant="accent-glow" size="icon" onClick={addItem} disabled={!newItem.trim()}>
                  <Plus className="h-4 w-4" />
                </ButtonGlow>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Grocery Categories */}
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
                        <div className="flex items-center flex-1">
                          <button
                            onClick={() => toggleItem(item.id)}
                            className={`mr-3 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                              item.checked
                                ? "border-accent bg-accent text-black"
                                : "border-white/30 hover:border-accent"
                            }`}
                          >
                            {item.checked && <Check className="h-4 w-4" />}
                          </button>
                          <div className="flex-1">
                            <span className={`font-medium ${item.checked ? "text-accent line-through" : "text-white"}`}>
                              {item.name}
                            </span>
                            {item.quantity && <p className="text-sm text-white/60">{item.quantity}</p>}
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-2 rounded-full p-1 text-white/40 hover:text-red-400 hover:bg-red-400/10"
                        >
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

        {/* Action Buttons */}
        {completedItems > 0 && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <ButtonGlow variant="outline-glow" onClick={clearCompleted} className="w-full">
              <Trash2 className="mr-2 h-4 w-4" /> Clear Completed Items
            </ButtonGlow>
          </motion.div>
        )}
      </div>
    </div>
  )
}
