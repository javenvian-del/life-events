'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { getStorageService } from '@/lib/storage'
import Image from 'next/image'

export default function NewEventPage() {
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const [lastEventYear, setLastEventYear] = useState<number | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUserAndGetLastEvent()
  }, [])

  const checkUserAndGetLastEvent = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUserId(user.id)

    // 获取用户最后一次输入的事件年份
    const { data } = await supabase
      .from('events')
      .select('event_date')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (data) {
      const lastYear = new Date(data.event_date).getFullYear()
      setLastEventYear(lastYear)
      // 设置默认日期为上次年份的1月1日
      setEventDate(`${lastYear}-01-01`)
    } else {
      // 如果是第一次添加，默认当前日期
      const today = new Date().toISOString().split('T')[0]
      setEventDate(today)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('照片大小不能超过 5MB')
        return
      }
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let photoUrl = ''

      // 如果有照片，先上传
      if (photo) {
        const storage = getStorageService()
        photoUrl = await storage.uploadPhoto(photo, userId)
      }

      // 创建事件
      const { error: insertError } = await supabase
        .from('events')
        .insert({
          user_id: userId,
          title,
          event_date: eventDate,
          description: description || null,
          photo_url: photoUrl || null,
        })

      if (insertError) throw insertError

      router.push('/timeline')
    } catch (err: any) {
      setError(err.message || '创建失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            ← 返回
          </button>
          <h1 className="text-lg font-semibold text-gray-900">添加事件</h1>
          <button
            onClick={handleSubmit}
            disabled={loading || !title || !eventDate}
            className="text-primary hover:text-primary-dark font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </header>

      {/* 表单内容 */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 事件名称 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              事件名称 <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="例如：结婚、毕业、第一份工作"
            />
          </div>

          {/* 发生时间 */}
          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
              发生时间 <span className="text-red-500">*</span>
              {lastEventYear && (
                <span className="text-xs text-gray-500 ml-2">
                  （已定位到{lastEventYear}年）
                </span>
              )}
            </label>
            <input
              id="eventDate"
              type="date"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* 事件描述 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              事件描述
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="记录这个事件的详细信息..."
            />
          </div>

          {/* 添加照片 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              添加照片
            </label>
            {photoPreview ? (
              <div className="relative">
                <div className="relative h-64 rounded-lg overflow-hidden">
                  <Image
                    src={photoPreview}
                    alt="预览"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null)
                    setPhotoPreview('')
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  删除
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">点击上传照片</p>
                  <p className="text-xs text-gray-400">支持 JPG、PNG 格式，最大 5MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </label>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}
        </form>
      </main>
    </div>
  )
}
