"use client"

import { useState } from "react"
import { ImageIcon, Trash2, Download, X, Maximize2, Loader2 } from "lucide-react"
import { useUser } from "@/contexts/user-context"

export function GalleryTab() {
  const { gallery, galleryCount, deleteImage, isLoading, email } = useUser()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDownload = (imageUrl: string, prompt: string) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `boomer-ai-art-${Date.now()}.png`
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDelete = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    setDeletingId(imageId)
    await deleteImage(imageId)
    setDeletingId(null)
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
          <p className="text-slate-600 font-medium">Loading your gallery...</p>
        </div>
      </div>
    )
  }

  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Sign in to view your gallery</h3>
          <p className="text-slate-600">Your AI art creations will appear here after you log in.</p>
        </div>
      </div>
    )
  }

  return (
    <section className="flex-1 flex flex-col p-4 overflow-hidden">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-900">My Gallery</h2>
        <p className="text-sm text-slate-600">
          {galleryCount} image{galleryCount !== 1 ? "s" : ""} created
        </p>
      </div>

      {gallery.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex p-4 bg-purple-100 rounded-full mb-4">
              <ImageIcon className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No images yet</h3>
            <p className="text-slate-600 mb-4">Create your first AI artwork from the Create Art button!</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {gallery.map((image) => (
              <div
                key={image.id}
                className="relative rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-white"
              >
                <img
                  src={image.imageUrl || "/placeholder.svg"}
                  alt={image.prompt}
                  className="w-full aspect-square object-cover cursor-pointer"
                  onClick={() => setSelectedImage(image.id)}
                />

                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload(image.imageUrl, image.prompt)
                    }}
                    className="p-2.5 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-colors touch-manipulation active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Download className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(image.id)
                    }}
                    disabled={deletingId === image.id}
                    className="p-2.5 bg-red-500 rounded-full shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50 touch-manipulation active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    {deletingId === image.id ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>

                <button
                  onClick={() => setSelectedImage(image.id)}
                  className="absolute bottom-2 left-2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors touch-manipulation active:scale-95 min-h-[40px] min-w-[40px] flex items-center justify-center"
                >
                  <Maximize2 className="w-4 h-4 text-slate-700" />
                </button>

                {/* Prompt caption */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-8">
                  <p className="text-xs text-white line-clamp-2">{image.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full-screen image viewer */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10 min-h-[48px] min-w-[48px] flex items-center justify-center touch-manipulation"
          >
            <X className="w-6 h-6" />
          </button>

          {(() => {
            const image = gallery.find((img) => img.id === selectedImage)
            if (!image) return null

            return (
              <>
                <img
                  src={image.imageUrl || "/placeholder.svg"}
                  alt={image.prompt}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-3">
                  <p className="text-white text-sm bg-black/50 px-3 py-2 rounded-lg line-clamp-2">{image.prompt}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(image.imageUrl, image.prompt)
                      }}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 min-h-[48px] touch-manipulation active:scale-95"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(image.id)
                        setSelectedImage(null)
                      }}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 min-h-[48px] touch-manipulation active:scale-95"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      )}
    </section>
  )
}
