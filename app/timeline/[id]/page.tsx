'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { Event } from '@/lib/types'
import { getStorageService } from '@/lib/storage'
import Image from 'next/image'

export default function EventDetailPage() {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    loadEvent()
  }, [])

  const loadEvent = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('加载失败:', error)
      router.push('/timeline')
    } else {
      setEvent(data)
      setTitle(data.title)
      setEventDate(data.event_date)
      setDescription(data.description || '')
      setPhotoPreview(data.photo_url || '')
    }
    setLoading(false)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('照片大小不能超过 5MB')
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

  const handleSave = async () => {
    setSaving(true)
    try {
      let photoUrl = event?.photo_url || ''

      // 如果上传了新照片
      if (photo) {
        const storage = getStorageService()
        // 删除旧照片
        if (event?.photo_url) {
          await storage.deletePhoto(event.photo_url)
        }
        // 上传新照片
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          photoUrl = await storage.uploadPhoto(photo, user.id)
        }
      }

      // 更新事件
      const { error } = await supabase
        .from('events')
        .update({
          title,
          event_date: eventDate,
          description: description || null,
          photo_url: photoUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)

      if (error) throw error

      setIsEditing(false)
      loadEvent()
    } catch (err: any) {
      alert(err.message || '保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这个事件吗？此操作不可恢复。')) {
      return
    }

    setDeleting(true)
    try {
      // 删除照片
      if (event?.photo_url) {
        const storage = getStorageService()
        await storage.deletePhoto(event.photo_url)
      }

      // 删除事件
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', params.id)

      if (error) throw error

      router.push('/timeline')
    } catch (err: any) {
      alert(err.message || '删除失败，请重试')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!event) {
    return null
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
          <h1 className="text-lg font-semibold text-gray-900">
            {isEditing ? '编辑事件' : '事件详情'}
          </h1>
          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-primary hover:text-primary-dark font-medium disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-primary hover:text-primary-dark font-medium"
            >
              编辑
            </button>
          )}
        </div>
      </header>

      {/* 内容 */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {isEditing ? (
          // 编辑模式
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                事件名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                发生时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                事件描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                照片
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

            <button
              onClick={() => {
                setIsEditing(false)
                setTitle(event.title)
                setEventDate(event.event_date)
                setDescription(event.description || '')
                setPhotoPreview(event.photo_url || '')
                setPhoto(null)
              }}
              className="w-full text-gray-600 hover:text-gray-900 py-2"
            >
              取消编辑
            </button>
          </div>
        ) : (
          // 查看模式
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
              <p className="text-gray-500 mt-2">{formatDate(event.event_date)}</p>
            </div>

            {event.photo_url && (
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image
                  src={event.photo_url}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {event.description && (
              <div>
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            <div className="pt-6 border-t">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? '删除中...' : '删除事件'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
