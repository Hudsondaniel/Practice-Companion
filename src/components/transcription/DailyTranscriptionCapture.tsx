import { useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { parseRecordingUrl } from '@/lib/recording-url'
import { parseTimeInput, formatTimestamp } from '@/lib/time-parse'
import { useTranscriptionStore } from '@/stores/transcription-store'
import { currentMonthYear } from '@/types/practice-method'

interface DailyTranscriptionCaptureProps {
  conceptLabel: string
  conceptId: string
  practiceDate: string
  onSaved: (projectId: string) => void
}

export function DailyTranscriptionCapture({
  conceptLabel,
  conceptId,
  practiceDate,
  onSaved,
}: DailyTranscriptionCaptureProps) {
  const addProject = useTranscriptionStore((s) => s.addProject)

  const [artist, setArtist] = useState('')
  const [title, setTitle] = useState('')
  const [recordingUrl, setRecordingUrl] = useState('')
  const [key, setKey] = useState('')
  const [sectionStart, setSectionStart] = useState('')
  const [sectionEnd, setSectionEnd] = useState('')
  const [barRange, setBarRange] = useState('')
  const [chordContext, setChordContext] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!artist.trim() || !title.trim() || !recordingUrl.trim()) {
      toast.error('Artist, title, and recording link are required')
      return
    }

    const parsed = parseRecordingUrl(recordingUrl)
    if (parsed.type === 'unknown') {
      toast.error('Unsupported link. Use YouTube, SoundSlice, or a direct audio URL.')
      return
    }

    const startSeconds = sectionStart.trim() ? parseTimeInput(sectionStart) : 0
    const endSeconds = sectionEnd.trim() ? parseTimeInput(sectionEnd) : null

    if (sectionStart.trim() && startSeconds == null) {
      toast.error('Invalid start time. Use format like 1:30')
      return
    }
    if (sectionEnd.trim() && endSeconds == null) {
      toast.error('Invalid end time. Use format like 1:45')
      return
    }
    if (endSeconds != null && startSeconds != null && endSeconds <= startSeconds) {
      toast.error('End time must be after start time')
      return
    }

    const segments =
      endSeconds != null && startSeconds != null
        ? [
            {
              label: barRange.trim() ? `Hero moment · ${barRange.trim()}` : "Today's hero moment",
              startSeconds,
              endSeconds,
              barRange: barRange.trim() || undefined,
              chordContext: chordContext.trim() || undefined,
              notes: notes.trim() || undefined,
              status: 'listening' as const,
              linkedConceptId: conceptId,
            },
          ]
        : []

    const projectId = addProject({
      artist: artist.trim(),
      title: title.trim(),
      recordingUrl: recordingUrl.trim(),
      key: key.trim() || undefined,
      monthYear: currentMonthYear(),
      practiceDate,
      linkedConceptId: conceptId,
      segments,
    })

    toast.success("Today's hero transcription saved")
    onSaved(projectId)
  }

  return (
    <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
      <p className="mb-1 text-sm font-semibold text-primary">Today&apos;s hero recording</p>
      <p className="mb-4 text-xs text-muted-foreground">
        Link Concept to Hero starts fresh each day. Add the recording you&apos;re drawing from today and
        mark the moment that connects to <strong>{conceptLabel}</strong>. It saves to your Transcriptions
        list automatically.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Artist" value={artist} onChange={setArtist} placeholder="Oscar Peterson" required />
          <Field label="Tune / title" value={title} onChange={setTitle} placeholder="C Jam Blues" required />
        </div>

        <Field
          label="Recording link"
          value={recordingUrl}
          onChange={setRecordingUrl}
          placeholder="YouTube, SoundSlice, or direct audio URL"
          required
        />

        <Field label="Key (optional)" value={key} onChange={setKey} placeholder="F blues" />

        <div className="rounded-md border border-border bg-background/60 p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Hero moment (optional now — you can add more sections after saving)
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Section start" value={sectionStart} onChange={setSectionStart} placeholder="1:32" />
            <Field label="Section end" value={sectionEnd} onChange={setSectionEnd} placeholder="1:45" />
            <Field label="Bar range" value={barRange} onChange={setBarRange} placeholder="bars 12–16" />
            <Field label="Chord context" value={chordContext} onChange={setChordContext} placeholder="F7 → Bbmaj7" />
          </div>
          <label className="mt-2 block text-xs text-muted-foreground">
            Notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why this moment connects to your concept…"
              rows={2}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          {sectionStart && sectionEnd && parseTimeInput(sectionStart) != null && parseTimeInput(sectionEnd) != null && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              Section length:{' '}
              {formatTimestamp(Math.max(0, parseTimeInput(sectionEnd)! - parseTimeInput(sectionStart)!))}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full sm:w-auto">
          Save today&apos;s transcription & continue
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
