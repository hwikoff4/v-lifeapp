"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Camera, Upload, Trash2, Eye } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ProgressPhoto {
  id: string
  date: string
  weight?: number
  note?: string
  imageUrl: string
  type: "front" | "side" | "back" | "custom"
}

interface ProgressPhotoModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (photo: Omit<ProgressPhoto, "id">) => void
  recentPhotos: ProgressPhoto[]
  currentWeight?: number
}

export function ProgressPhotoModal({ isOpen, onClose, onAdd, recentPhotos, currentWeight }: ProgressPhotoModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [photoType, setPhotoType] = useState<"front" | "side" | "back" | "custom">("front")
  const [weight, setWeight] = useState(currentWeight?.toString() || "")
  const [note, setNote] = useState("")
  const [previewMode, setPreviewMode] = useState(false)
  const [selectedPhotoForPreview, setSelectedPhotoForPreview] = useState<ProgressPhoto | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const photoTypes = [
    { id: "front", name: "Front View", description: "Face forward, arms at sides" },
    { id: "side", name: "Side View", description: "Profile view, arms at sides" },
    { id: "back", name: "Back View", description: "Back facing camera" },
    { id: "custom", name: "Custom", description: "Your own pose/angle" },
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setSelectedImage(imageUrl)
    }
  }

  const handleAdd = () => {
    if (selectedImage) {
      const today = new Date().toISOString().split("T")[0]
      onAdd({
        date: today,
        weight: weight ? Number.parseFloat(weight) : undefined,
        note: note.trim() || undefined,
        imageUrl: selectedImage,
        type: photoType,
      })

      // Reset form
      setSelectedImage(null)
      setWeight(currentWeight?.toString() || "")
      setNote("")
      setPhotoType("front")
      onClose()
    }
  }

  const openPreview = (photo: ProgressPhoto) => {
    setSelectedPhotoForPreview(photo)
    setPreviewMode(true)
  }

  const closePreview = () => {
    setPreviewMode(false)
    setSelectedPhotoForPreview(null)
  }

  // Preview Mode
  if (previewMode && selectedPhotoForPreview) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePreview}
        >
          <motion.div
            className="w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="border-accent/30 bg-black/95 backdrop-blur-lg">
              <div className="flex items-center justify-between border-b border-accent/20 p-4">
                <div>
                  <h3 className="font-bold text-white">Progress Photo</h3>
                  <p className="text-xs text-accent">{selectedPhotoForPreview.date}</p>
                </div>
                <button onClick={closePreview} className="rounded-full p-1 hover:bg-white/10">
                  <X className="h-5 w-5 text-white/60" />
                </button>
              </div>

              <CardContent className="p-0">
                <div className="aspect-[3/4] w-full">
                  <img
                    src={selectedPhotoForPreview.imageUrl || "/placeholder.svg"}
                    alt="Progress photo"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Type:</span>
                    <span className="text-white capitalize">{selectedPhotoForPreview.type} View</span>
                  </div>

                  {selectedPhotoForPreview.weight && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Weight:</span>
                      <span className="text-accent font-medium">{selectedPhotoForPreview.weight} lbs</span>
                    </div>
                  )}

                  {selectedPhotoForPreview.note && (
                    <div className="space-y-1">
                      <span className="text-white/70 text-sm">Note:</span>
                      <p className="text-white text-sm bg-black/30 rounded p-2">{selectedPhotoForPreview.note}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Main Modal
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4 pb-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="border-accent/30 bg-black/90 backdrop-blur-lg flex flex-col max-h-[75vh]">
              <div className="flex items-center justify-between border-b border-accent/20 p-4 flex-shrink-0">
                <div className="flex items-center">
                  <Camera className="mr-3 h-6 w-6 text-accent" />
                  <div>
                    <h3 className="font-bold text-white">Progress Photo</h3>
                    <p className="text-xs text-accent">Document your transformation</p>
                  </div>
                </div>
                <button onClick={onClose} className="rounded-full p-1 hover:bg-white/10">
                  <X className="h-5 w-5 text-white/60" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Photo Upload Section */}
                <div className="space-y-3">
                  <Label className="text-white">Take or Upload Photo</Label>

                  {!selectedImage ? (
                    <div className="space-y-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-[3/4] flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-accent/50 bg-black/30 transition-all hover:border-accent hover:bg-accent/5"
                      >
                        <Upload className="mb-3 h-12 w-12 text-accent/70" />
                        <p className="text-white/70 text-center">
                          <span className="font-medium text-accent">Click to upload</span>
                          <br />
                          or drag and drop
                        </p>
                        <p className="text-xs text-white/50 mt-2">PNG, JPG up to 10MB</p>
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="aspect-[3/4] w-full rounded-lg overflow-hidden">
                        <img
                          src={selectedImage || "/placeholder.svg"}
                          alt="Selected progress photo"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-2 right-2 rounded-full bg-black/70 p-2 hover:bg-black/90"
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Photo Type Selection */}
                <div className="space-y-2">
                  <Label className="text-white">Photo Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {photoTypes.map((type) => (
                      <Card
                        key={type.id}
                        className={`cursor-pointer transition-all hover:border-accent/50 ${
                          photoType === type.id
                            ? "border-accent border-glow bg-accent/10"
                            : "border-white/10 bg-black/30"
                        }`}
                        onClick={() => setPhotoType(type.id as any)}
                      >
                        <CardContent className="p-3">
                          <h4 className={`font-medium text-sm ${photoType === type.id ? "text-accent" : "text-white"}`}>
                            {type.name}
                          </h4>
                          <p className="text-xs text-white/60 mt-1">{type.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Weight Input */}
                <div className="space-y-2">
                  <Label htmlFor="photo-weight" className="text-white">
                    Current Weight (Optional)
                  </Label>
                  <div className="relative">
                    <Input
                      id="photo-weight"
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Enter current weight"
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60">lbs</span>
                  </div>
                </div>

                {/* Note Input */}
                <div className="space-y-2">
                  <Label htmlFor="photo-note" className="text-white">
                    Note (Optional)
                  </Label>
                  <Input
                    id="photo-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="How are you feeling? Any observations..."
                    className="w-full"
                  />
                </div>

                {/* Recent Photos */}
                {recentPhotos.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-white">Recent Photos</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {recentPhotos
                        .slice(-6)
                        .reverse()
                        .map((photo) => (
                          <div key={photo.id} className="relative group">
                            <div className="aspect-[3/4] rounded-lg overflow-hidden cursor-pointer">
                              <img
                                src={photo.imageUrl || "/placeholder.svg"}
                                alt={`Progress photo from ${photo.date}`}
                                className="h-full w-full object-cover transition-all group-hover:scale-105"
                                onClick={() => openPreview(photo)}
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all rounded-lg flex items-center justify-center">
                              <Eye className="h-6 w-6 text-white" />
                            </div>
                            <div className="absolute bottom-1 left-1 right-1">
                              <div className="bg-black/70 rounded px-2 py-1">
                                <p className="text-xs text-white font-medium">{photo.type}</p>
                                <p className="text-xs text-white/70">{photo.date}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-accent/20 p-4 flex gap-3 flex-shrink-0">
                <ButtonGlow variant="outline-glow" onClick={onClose} className="flex-1">
                  Cancel
                </ButtonGlow>
                <ButtonGlow variant="accent-glow" onClick={handleAdd} disabled={!selectedImage} className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Save Photo
                </ButtonGlow>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
