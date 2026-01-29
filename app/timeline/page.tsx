'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Event } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'

export default function TimelinePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    loadEvents()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    } else {
      setUser(user)
    }
  }

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false })

    if (error) {
      console.error('加载事件失败:', error)
    } else {
      setEvents(data || [])
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // 按年份分组事件
  const groupByYear = (events: Event[]) => {
    const groups: { [key: string]: Event[] } = {}
    events.forEach(event => {
      const year = new Date(event.event_date).getFullYear().toString()
      if (!groups[year]) {
        groups[year] = []
      }
      groups[year].push(event)
    })
    return groups
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`
  }

  const groupedEvents = groupByYear(events)
  const years = Object.keys(groupedEvents).sort((a, b) => parseInt(b) - parseInt(a))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">人生大事</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/timeline/new"
              className="w-10 h-10 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center text-2xl font-light transition-colors"
            >
              +
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      {/* 时间轴内容 */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {events.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">还没有记录任何事件</p>
            <Link
              href="/timeline/new"
              className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors"
            >
              开始记录你的人生大事吧
            </Link>
          </div>
        ) : (
          <div className="relative">
            {/* 垂直时间线 */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-light"></div>

            {years.map((year, yearIndex) => (
              <div key={year} className="mb-12">
                {/* 年份标题 */}
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{year} 年</h2>

                {/* 该年的事件 */}
                <div className="space-y-6">
                  {groupedEvents[year].map((event, eventIndex) => (
                    <Link
                      key={event.id}
                      href={`/timeline/${event.id}`}
                      className="block pl-16 relative group"
                    >
                      {/* 圆点 */}
                      <div className="absolute left-6 w-4 h-4 bg-primary rounded-full border-4 border-white shadow group-hover:scale-125 transition-transform"></div>

                      {/* 事件卡片 */}
                      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">{formatDate(event.event_date)}</p>

                        {event.photo_url && (
                          <div className="mt-3 relative h-48 rounded-lg overflow-hidden">
                            <Image
                              src={event.photo_url}
                              alt={event.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        {event.description && (
                          <p className="text-gray-600 text-sm mt-3 line-clamp-2">{event.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
