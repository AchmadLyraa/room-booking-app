"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function TopLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)

    const timeout = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timeout)
  }, [pathname])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed top-0 left-0 h-[3px] w-full z-[9999]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="h-full bg-[#04a1e9]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}