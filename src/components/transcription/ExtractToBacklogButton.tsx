import toast from 'react-hot-toast'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePracticeStore } from '@/stores/practice-store'
import type { TranscriptionProject, TranscriptionSegment } from '@/types/transcription'

interface ExtractToBacklogButtonProps {
  project: TranscriptionProject
  segment: TranscriptionSegment
}

export function ExtractToBacklogButton({ project, segment }: ExtractToBacklogButtonProps) {
  const addBacklogItem = usePracticeStore((s) => s.addBacklogItem)

  const handleExtract = () => {
    const label = segment.barRange
      ? `Hero gesture · ${segment.barRange}`
      : `${project.title} · ${segment.label}`

    addBacklogItem({
      label,
      description: segment.notes ?? `Extracted from ${project.artist} — ${project.title}`,
      harmonicContext: segment.chordContext ?? 'From transcription',
      keys: project.key ? [project.key] : [],
      tier: 'future',
      sourceRecording: `${project.artist} — ${project.title}`,
    })
    toast.success('Added to Device Backlog (Future tier)')
  }

  return (
    <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={handleExtract}>
      <Sparkles className="h-3 w-3" />
      Extract to backlog
    </Button>
  )
}
