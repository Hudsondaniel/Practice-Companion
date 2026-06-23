import { useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { parseTimeInput, formatTimestamp } from '@/lib/time-parse'
import { useTranscriptionStore } from '@/stores/transcription-store'

interface MonthlyTranscriptionSectionCaptureProps {
  projectId: string
  onSaved: (segmentId: string) => void
}

/** Add a new section to the monthly transcription song during guided practice. */
export function MonthlyTranscriptionSectionCapture({
  projectId,
  onSaved,
}: MonthlyTranscriptionSectionCaptureProps) {
  const addSegment = useTranscriptionStore((s) => s.addSegment)
  const project = useTranscriptionStore((s) => s.getProject(projectId))

  const [sectionStart, setSectionStart] = useState('')
  const [sectionEnd, setSectionEnd] = useState('')
  const [barRange, setBarRange] = useState('')
  const [chordContext, setChordContext] = useState('')
  const [notes, setNotes] = useState('')

  if (!project) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sectionStart.trim() || !sectionEnd.trim()) {
      toast.error('Section start and end times are required')
      return
    }

    const startSeconds = parseTimeInput(sectionStart)
    const endSeconds = parseTimeInput(sectionEnd)

    if (startSeconds == null || endSeconds == null) {
      toast.error('Invalid time. Use format like 1:30')
      return
    }
    if (endSeconds <= startSeconds) {
      toast.error('End time must be after start time')
      return
    }

    const label = barRange.trim()
      ? `Section · ${barRange.trim()}`
      : `Section ${project.segments.length + 1}`

    const segmentId = addSegment(projectId, {
      label,
      startSeconds,
      endSeconds,
      barRange: barRange.trim() || undefined,
      chordContext: chordContext.trim() || undefined,
      notes: notes.trim() || undefined,
      status: 'listening',
    })

    toast.success('Section added to your monthly transcription')
    setSectionStart('')
    setSectionEnd('')
    setBarRange('')
    setChordContext('')
    setNotes('')
    onSaved(segmentId)
  }

  return (
    <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
      <p className="mb-1 text-sm font-semibold text-primary">
        {project.artist} — {project.title}
      </p>
      <p className="mb-4 text-xs text-muted-foreground">
        Add a section to transcribe this month. You&apos;ll work through sections across your practice
        sessions — one song, building line by line.
        {project.segments.length > 0 && (
          <span className="mt-1 block">
            {project.segments.length} section{project.segments.length !== 1 ? 's' : ''} saved so far.
          </span>
        )}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Section start" value={sectionStart} onChange={setSectionStart} placeholder="1:32" required />
          <Field label="Section end" value={sectionEnd} onChange={setSectionEnd} placeholder="1:45" required />
          <Field label="Bar range" value={barRange} onChange={setBarRange} placeholder="bars 12–16" />
          <Field label="Chord context" value={chordContext} onChange={setChordContext} placeholder="F7 → Bbmaj7" />
        </div>
        <label className="block text-xs">
          <span className="mb-1 block font-medium text-muted-foreground">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What draws you to this passage…"
            rows={2}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        {sectionStart && sectionEnd && parseTimeInput(sectionStart) != null && parseTimeInput(sectionEnd) != null && (
          <p className="text-[10px] text-muted-foreground">
            Section length:{' '}
            {formatTimestamp(Math.max(0, parseTimeInput(sectionEnd)! - parseTimeInput(sectionStart)!))}
          </p>
        )}
        <Button type="submit" className="w-full sm:w-auto">
          Add section
        </Button>
      </form>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block font-medium text-muted-foreground">{label}</span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="h-9 text-sm"
      />
    </label>
  )
}
