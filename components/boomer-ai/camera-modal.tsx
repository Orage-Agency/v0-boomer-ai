"use client"

import { useRef, useState, useEffect } from "react"
import { Camera, X, RotateCw, Check } from "lucide-react"

interface CameraModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (imageData: string) => void
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setError(null)
    } catch (err) {
      setError("Unable to access camera. Please check permissions.")
      console.error("Camera error:", err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg", 0.8)
        setCapturedImage(imageData)
        stopCamera()
      }
    }
  }

  const retake = () => {
    setCapturedImage(null)
    startCamera()
  }

  const confirm = () => {
    if (capturedImage) {
      onCapture(capturedImage)
      setCapturedImage(null)
      onClose()
    }
  }

  const handleClose = () => {
    setCapturedImage(null)
    stopCamera()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 bg-black/50">
        <h2 className="text-white text-xl font-bold">Take a Picture</h2>
        <button onClick={handleClose} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-grow flex items-center justify-center relative overflow-hidden">
        {error ? (
          <div className="text-center p-6">
            <p className="text-white text-lg mb-4">{error}</p>
            <button
              onClick={startCamera}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage || "/placeholder.svg"}
            alt="Captured"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <video ref={videoRef} autoPlay playsInline className="max-w-full max-h-full object-contain" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 p-6 bg-black/50">
        {capturedImage ? (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={retake}
              className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-xl font-semibold hover:bg-slate-700 transition-colors"
            >
              <RotateCw className="w-5 h-5" />
              Retake
            </button>
            <button
              onClick={confirm}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              <Check className="w-5 h-5" />
              Use This Photo
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <button
              onClick={takePicture}
              disabled={!stream}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              <Camera className="w-10 h-10 text-slate-900" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
