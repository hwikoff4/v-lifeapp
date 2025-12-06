"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Pill } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Card } from "@/components/ui/card"

interface VitalFlowSupplementModalProps {
  isOpen: boolean
  onClose: () => void
  purchaseUrl?: string
}

export function VitalFlowSupplementModal({ isOpen, onClose, purchaseUrl }: VitalFlowSupplementModalProps) {
  const handlePurchase = () => {
    if (purchaseUrl) {
      window.open(purchaseUrl, "_blank", "noopener,noreferrer")
    }
  }

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
                  <Pill className="mr-3 h-6 w-6 text-accent" />
                  <div>
                    <h3 className="font-bold text-white">Vital Flow</h3>
                    <p className="text-xs text-accent">Testosterone Support</p>
                  </div>
                </div>
                <button onClick={onClose} className="rounded-full p-1 hover:bg-white/10">
                  <X className="h-5 w-5 text-white/60" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Description */}
                <div className="space-y-2">
                  <p className="text-sm text-white/90 leading-relaxed">
                    Vital Flow is a premium testosterone support supplement designed to help optimize 
                    your natural hormone production, energy levels, and overall vitality.
                  </p>
                </div>

                {/* Key Benefits */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">Key Benefits</h4>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>Supports healthy testosterone levels naturally</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>Enhances energy and vitality throughout the day</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>Promotes lean muscle development and recovery</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>Improves mental clarity and focus</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>Supports overall male health and performance</span>
                    </li>
                  </ul>
                </div>

                {/* Additional Info */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">What's Inside</h4>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Formulated with clinically-studied ingredients including D-Aspartic Acid, 
                    Fenugreek Extract, Zinc, Magnesium, and Vitamin D3 to support optimal 
                    hormonal balance and male vitality.
                  </p>
                </div>
              </div>

              <div className="border-t border-accent/20 p-4 flex-shrink-0">
                <ButtonGlow 
                  variant="accent-glow" 
                  className="w-full" 
                  onClick={handlePurchase}
                  disabled={!purchaseUrl}
                >
                  {purchaseUrl ? "Shop Now" : "Purchases coming soon!"}
                </ButtonGlow>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

