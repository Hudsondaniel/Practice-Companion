import { useCallback, useRef } from 'react'
import { useSessionToolsStore } from '@/stores/session-tools-store'

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function qualityToBitrate(q: 'standard' | 'high'): number {
  return q === 'high' ? 256_000 : 128_000
}

export function useRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const errorRef = useRef<string | null>(null)
  const { setWaveformPeaks, setRecordingBlobUrl, setRecordingBase64, recordingQuality } =
    useSessionToolsStore()

  const start = useCallback(async () => {
    errorRef.current = null
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      })

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: qualityToBitrate(recordingQuality),
      })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        setRecordingBlobUrl(url)

        try {
          const base64 = await blobToBase64(blob)
          setRecordingBase64(base64)
        } catch {
          /* persist optional */
        }

        const arrayBuffer = await blob.arrayBuffer()
        const audioContext = new AudioContext()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        const channelData = audioBuffer.getChannelData(0)
        const samples = 200
        const blockSize = Math.floor(channelData.length / samples)
        const peaks: number[] = []
        for (let i = 0; i < samples; i++) {
          let sum = 0
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channelData[i * blockSize + j] ?? 0)
          }
          peaks.push(sum / blockSize)
        }
        const max = Math.max(...peaks, 0.001)
        setWaveformPeaks(peaks.map((p) => p / max))
        stream.getTracks().forEach((t) => t.stop())
        await audioContext.close()
      }

      mediaRecorderRef.current = recorder
      recorder.start(100)
    } catch {
      errorRef.current = 'Microphone access denied or unavailable'
    }
  }, [setWaveformPeaks, setRecordingBlobUrl, setRecordingBase64, recordingQuality])

  const stop = useCallback(async () => {
    mediaRecorderRef.current?.stop()
  }, [])

  return {
    start,
    stop,
    get error() {
      return errorRef.current
    },
  }
}
