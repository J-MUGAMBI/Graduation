/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { Image as ImageIcon, Upload, X, Trash2 } from 'lucide-react'
import NextImage from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import type { PhotoView } from '@/types/database'

const MAX_SIZE_MB = 5

export function GalleryTab() {
  const { user, profile } = useAuth()
  const [photos, setPhotos] = useState<PhotoView[]>([])
  const [caption, setCaption] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<PhotoView | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = useMemo(() => createClient(), [])

  const load = useCallback(async () => {
    const { data } = await supabase.from('photos_view').select('*').eq('approved', true).order('created_at', { ascending: false }).limit(100)
    setPhotos(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    load()
    const channel = supabase.channel('photos-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, load])

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  const handleFile = (f: File) => {
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return toast.error(`Photo must be under ${MAX_SIZE_MB}MB.`)
    if (preview) URL.revokeObjectURL(preview)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleUpload = async () => {
    if (!profile) return toast.error('Please enter your name on the Home tab first.')
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user!.id}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('event-photos').upload(path, file, { contentType: file.type })
      if (uploadError) return toast.error(uploadError.message)
      const { data: { publicUrl } } = supabase.storage.from('event-photos').getPublicUrl(path)
      const { error } = await (supabase as any).from('photos').insert({ user_id: user!.id, storage_path: path, public_url: publicUrl, caption })
      if (error) return toast.error(error.message)
      toast.success('Photo uploaded! 📸')
      setFile(null)
      setPreview(null)
      setCaption('')
      if (fileRef.current) fileRef.current.value = ''
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (photo: PhotoView) => {
    await supabase.storage.from('event-photos').remove([photo.storage_path])
    const { error } = await (supabase as any).from('photos').delete().eq('id', photo.id)
    if (error) toast.error(error.message)
    else toast.success('Photo removed.')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card">
        <h2 className="section-title flex items-center gap-2"><Upload className="w-5 h-5 text-gold-500" /> Share a Photo</h2>
        <div
          className="border-2 border-dashed border-gold-300 rounded-xl p-6 text-center cursor-pointer hover:border-gold-500 hover:bg-gold-50 transition-all"
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        >
          {preview ? (
            <div className="relative inline-block">
              <NextImage src={preview} alt="Preview" width={200} height={150} className="rounded-xl object-cover mx-auto" style={{ maxHeight: 150 }} />
              <button onClick={e => { e.stopPropagation(); setPreview(null); setFile(null) }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <ImageIcon className="w-10 h-10 text-gold-300" />
              <p className="text-sm font-medium">Click or drag a photo here</p>
              <p className="text-xs">JPG, PNG, WEBP · Max {MAX_SIZE_MB}MB</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        <input className="input mt-3" placeholder="Add a caption (optional)" value={caption} onChange={e => setCaption(e.target.value)} />
        <button onClick={handleUpload} disabled={uploading || !file} className="btn-primary w-full mt-3 flex items-center justify-center gap-2">
          {uploading ? <Spinner size="sm" /> : <Upload className="w-4 h-4" />} Upload Photo
        </button>
      </div>

      <div className="card">
        <h2 className="section-title flex items-center gap-2"><ImageIcon className="w-5 h-5 text-gold-500" /> Shared Gallery</h2>
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : photos.length === 0 ? (
          <EmptyState icon={ImageIcon} title="No photos yet" description="Be the first to share a memory!" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map(photo => (
              <div key={photo.id} className="group relative rounded-xl overflow-hidden cursor-pointer" onClick={() => setLightbox(photo)}>
                <NextImage src={photo.public_url} alt={photo.caption ?? 'Graduation photo'} width={200} height={200} className="w-full h-40 object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-navy-500/0 group-hover:bg-navy-500/40 transition-all flex items-end p-2">
                  <p className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">{photo.caption || photo.display_name}</p>
                </div>
                {(user?.id === photo.user_id || profile?.is_admin) && (
                  <button onClick={e => { e.stopPropagation(); handleDelete(photo) }} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)} className="absolute -top-10 right-0 text-white hover:text-gold-400"><X className="w-6 h-6" /></button>
            <NextImage src={lightbox.public_url} alt={lightbox.caption ?? ''} width={900} height={600} className="rounded-2xl w-full object-contain max-h-[80vh]" />
            {lightbox.caption && <p className="text-white text-center mt-3 font-medium">{lightbox.caption}</p>}
            <p className="text-gray-400 text-center text-sm mt-1">by {lightbox.display_name}</p>
          </div>
        </div>
      )}
    </div>
  )
}
