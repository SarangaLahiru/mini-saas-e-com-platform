import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productsAPI } from '../../../services/api'
import Card from '../../../components/ui/Card'
import Skeleton from '../../../components/ui/Skeleton'

const CategoryCarousel = ({ limit = 15, autoPlay = true, intervalMs = 3500 }) => {
  const scrollerRef = useRef(null)
  const [isHovering, setIsHovering] = useState(false)
  const { data, isLoading } = useQuery({
    queryKey: ['categories', limit],
    queryFn: () => productsAPI.getCategories({ limit }),
  })
  const categories = data?.categories || []

  const scrollBy = (dx) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: dx, behavior: 'smooth' })
  }

  // Autoplay: scrolls by one card width periodically, pauses on hover and when not focused
  useEffect(() => {
    if (!autoPlay) return
    const el = scrollerRef.current
    if (!el) return
    let raf
    const step = () => {
      if (!isHovering && document.visibilityState === 'visible') {
        const card = el.querySelector('[data-cat-card]')
        const delta = card ? card.clientWidth + 16 : 280
        const atEnd = Math.abs(el.scrollWidth - el.clientWidth - el.scrollLeft) < 4
        if (atEnd) {
          el.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          el.scrollBy({ left: delta, behavior: 'smooth' })
        }
      }
      raf = window.setTimeout(step, intervalMs)
    }
    raf = window.setTimeout(step, intervalMs)
    return () => window.clearTimeout(raf)
  }, [autoPlay, intervalMs, isHovering])

  if (isLoading) {
    return (
      <div className="relative">
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="w-48 h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (categories.length === 0) return null

  return (
    <div className="relative">
      <button
        aria-label="Scroll left"
        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 backdrop-blur shadow ring-1 ring-gray-200 items-center justify-center hover:shadow-md"
        onClick={() => scrollBy(-300)}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
      </button>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth pr-1"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {categories.map((category) => {
          const bgImage = category.image ? { backgroundImage: `url(${category.image})` } : {}
          return (
            <motion.div key={category.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Link to={`/category/${category.slug}`}>
                <Card
                  hover
                  data-cat-card
                  className="w-56 h-36 rounded-2xl relative overflow-hidden group ring-1 ring-gray-100 bg-gray-100"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={bgImage}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/50 group-hover:from-black/0 group-hover:via-black/0 group-hover:to-black/40 transition-colors" />
                  <div className="relative z-10 h-full w-full flex flex-col items-center justify-end p-4 text-center">
                    <div className="px-3 py-1.5 rounded-full bg-white/90 text-gray-900 text-sm font-semibold shadow-sm backdrop-blur group-hover:bg-white transition-colors">
                      {category.name}
                    </div>
                    <p className="text-[11px] text-white/80 mt-2">
                      {category.products_count || 0} products
                    </p>
                  </div>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>

      <button
        aria-label="Scroll right"
        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 backdrop-blur shadow ring-1 ring-gray-200 items-center justify-center hover:shadow-md"
        onClick={() => scrollBy(300)}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
  )
}

export default CategoryCarousel


