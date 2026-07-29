import { useLocation } from 'react-router-dom'
import { Construction } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PlaceholderPage() {
  const { pathname } = useLocation()
  const name = pathname.split('/').pop()?.replace(/-/g, ' ') ?? 'page'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[60vh] flex-col items-center justify-center text-center"
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400">
        <Construction size={28} />
      </div>
      <h1 className="text-2xl font-bold capitalize text-slate-900 dark:text-slate-100">{name}</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        This feature is coming in the next release. Stay tuned!
      </p>
    </motion.div>
  )
}
