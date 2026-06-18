import { useEffect, useState } from 'react'
import { ExternalLink, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { TranscriptionPlayer } from '@/components/transcription/TranscriptionPlayer'
import { ExtractToBacklogButton } from '@/components/transcription/ExtractToBacklogButton'
import { parseRecordingUrl, recordingTypeLabel } from '@/lib/recording-url'
import { formatTimestamp, parseTimeInput } from '@/lib/time-parse'
import { useTranscriptionStore } from '@/stores/transcription-store'
import { usePracticeStore } from '@/stores/practice-store'
import { currentMonthYear } from '@/types/practice-method'
import { TRANSCRIPTION_STAGE_LABELS, type SegmentStatus, type TranscriptionProject } from '@/types/transcription'
import { cn } from '@/lib/utils'

const STATUS_LABELS = TRANSCRIPTION_STAGE_LABELS

export function Transcriptions() {
  const {
    projects,
    activeProjectId,
    selectedSegmentId,
    addProject,
    deleteProject,
    setActiveProject,
    setSelectedSegment,
    addSegment,
    updateSegment,
    deleteSegment,
  } = useTranscriptionStore()

  const [showForm, setShowForm] = useState(projects.length === 0)

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? projects[0] ?? null

  const handleAddProject = (data: {
    artist: string
    title: string
    recordingUrl: string
    key?: string
  }) => {
    const parsed = parseRecordingUrl(data.recordingUrl)
    if (parsed.type === 'unknown') {
      toast.error('Unsupported link. Try YouTube, SoundSlice, or a direct audio URL (.mp3, .wav).')
      return
    }
    const id = addProject({ ...data, monthYear: currentMonthYear() })
    setActiveProject(id)
    setShowForm(false)
    toast.success('Transcription added')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transcriptions</h1>
          <p className="text-muted-foreground">
            Add a recording link, mark time sections, and loop them while you transcribe
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          New transcription
        </Button>
      </div>

      {showForm && (
        <NewTranscriptionForm
          onSubmit={handleAddProject}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your list</p>
          {projects.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-sm text-muted-foreground">
                No transcriptions yet. Add a recording link to get started.
              </CardContent>
            </Card>
          ) : (
            projects.map((project) => (
              <TranscriptionListItem
                key={project.id}
                project={project}
                selected={project.id === activeProject?.id}
                onSelect={() => setActiveProject(project.id)}
                onDelete={() => {
                  if (window.confirm(`Delete "${project.title}"?`)) {
                    deleteProject(project.id)
                    toast.success('Deleted')
                  }
                }}
              />
            ))
          )}
        </aside>

        {activeProject ? (
          <TranscriptionDetail
            project={activeProject}
            selectedSegmentId={selectedSegmentId}
            onSelectSegment={setSelectedSegment}
            onAddSegment={addSegment}
            onUpdateSegment={updateSegment}
            onDeleteSegment={deleteSegment}
          />
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Select or create a transcription to open the player
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function TranscriptionListItem({
  project,
  selected,
  onSelect,
  onDelete,
}: {
  project: TranscriptionProject
  selected: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const parsed = parseRecordingUrl(project.recordingUrl)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-lg border p-3 text-left transition-colors',
        selected ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50',
      )}
    >
      {project.practiceDate && (
        <Badge variant="outline" className="mb-2 text-[9px]">
          Daily hero · {project.practiceDate}
        </Badge>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{project.title}</p>
          <p className="truncate text-xs text-muted-foreground">{project.artist}</p>
        </div>
        <Badge variant="secondary" className="shrink-0 text-[10px]">
          {recordingTypeLabel(parsed.type)}
        </Badge>
      </div>
      <p className="mt-1 truncate text-[10px] text-primary">{project.recordingUrl}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {project.segments.length} section{project.segments.length === 1 ? '' : 's'}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </button>
  )
}

function NewTranscriptionForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: { artist: string; title: string; recordingUrl: string; key?: string }) => void
  onCancel: () => void
}) {
  const [artist, setArtist] = useState('')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [key, setKey] = useState('')

  return (
    <Card className="border-primary/40">
      <CardHeader>
        <CardTitle>New transcription</CardTitle>
        <CardDescription>
          Paste a YouTube, SoundSlice, or direct audio link (.mp3, .wav). You&apos;ll mark time sections after saving.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!artist.trim() || !title.trim() || !url.trim()) {
              toast.error('Artist, title, and recording link are required')
              return
            }
            onSubmit({ artist: artist.trim(), title: title.trim(), recordingUrl: url.trim(), key: key.trim() || undefined })
          }}
        >
          <Field label="Artist" value={artist} onChange={setArtist} placeholder="Oscar Peterson" />
          <Field label="Title" value={title} onChange={setTitle} placeholder="C Jam Blues" />
          <div className="md:col-span-2">
            <Field
              label="Recording link"
              value={url}
              onChange={setUrl}
              placeholder="YouTube, SoundSlice, or https://…/file.mp3"
            />
          </div>
          <Field label="Key (optional)" value={key} onChange={setKey} placeholder="F blues" />
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit">Save & open</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function TranscriptionDetail({
  project,
  selectedSegmentId,
  onSelectSegment,
  onAddSegment,
  onUpdateSegment,
  onDeleteSegment,
}: {
  project: TranscriptionProject
  selectedSegmentId: string | null
  onSelectSegment: (id: string | null) => void
  onAddSegment: ReturnType<typeof useTranscriptionStore.getState>['addSegment']
  onUpdateSegment: ReturnType<typeof useTranscriptionStore.getState>['updateSegment']
  onDeleteSegment: ReturnType<typeof useTranscriptionStore.getState>['deleteSegment']
}) {
  const parsed = parseRecordingUrl(project.recordingUrl)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>{project.artist}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>{recordingTypeLabel(parsed.type)}</Badge>
              {project.key && <Badge variant="secondary">{project.key}</Badge>}
              <Button variant="outline" size="sm" asChild>
                <a href={project.recordingUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open link
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TranscriptionPlayer
            project={project}
            activeSegmentId={selectedSegmentId}
            onSegmentTimesChange={(segmentId, start, end) =>
              onUpdateSegment(project.id, segmentId, { startSeconds: start, endSeconds: end })
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base">Time sections</CardTitle>
            <CardDescription>
              Mark the exact passage you&apos;re transcribing. Select one to loop and focus the player.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => {
              const last = project.segments[project.segments.length - 1]
              const start = last ? last.endSeconds : 0
              onAddSegment(project.id, {
                label: `Section ${project.segments.length + 1}`,
                startSeconds: start,
                endSeconds: start + 8,
                status: 'listening',
              })
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add section
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {project.segments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add a section with start/end times (e.g. 0:32 to 0:45). The player will zoom to that range and loop it.
            </p>
          ) : (
            project.segments.map((seg) => (
              <SegmentRow
                key={seg.id}
                project={project}
                segment={seg}
                selected={seg.id === selectedSegmentId}
                onSelect={() => onSelectSegment(seg.id === selectedSegmentId ? null : seg.id)}
                onUpdate={(updates) => onUpdateSegment(project.id, seg.id, updates)}
                onDelete={() => onDeleteSegment(project.id, seg.id)}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SegmentRow({
  project,
  segment,
  selected,
  onSelect,
  onUpdate,
  onDelete,
}: {
  project: TranscriptionProject
  segment: TranscriptionProject['segments'][0]
  selected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<TranscriptionProject['segments'][0]>) => void
  onDelete: () => void
}) {
  const { activeConcept } = usePracticeStore()

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-colors',
        selected ? 'border-primary bg-primary/5' : 'border-border',
      )}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button type="button" onClick={onSelect} className="font-medium text-sm hover:text-primary">
          {segment.label}
        </button>
        <Badge variant={selected ? 'default' : 'secondary'} className="text-[10px]">
          {formatTimestamp(segment.startSeconds)} – {formatTimestamp(segment.endSeconds)}
        </Badge>
        <select
          value={segment.status}
          onChange={(e) => onUpdate({ status: e.target.value as SegmentStatus })}
          className="rounded border border-border bg-background px-2 py-0.5 text-xs"
        >
          {(Object.keys(STATUS_LABELS) as SegmentStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <Button variant="ghost" size="icon" className="ml-auto h-7 w-7" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
        <ExtractToBacklogButton project={project} segment={segment} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Field
          label="Label"
          value={segment.label}
          onChange={(v) => onUpdate({ label: v })}
          compact
        />
        <TimeField
          label="Start"
          value={segment.startSeconds}
          onChange={(v) => onUpdate({ startSeconds: v })}
        />
        <TimeField
          label="End"
          value={segment.endSeconds}
          onChange={(v) => onUpdate({ endSeconds: v })}
        />
        <Field
          label="Bars"
          value={segment.barRange ?? ''}
          onChange={(v) => onUpdate({ barRange: v || undefined })}
          placeholder="bars 12–16"
          compact
        />
      </div>
      {activeConcept && (
        <label className="mt-2 flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={segment.linkedConceptId === activeConcept.id}
            onChange={(e) =>
              onUpdate({ linkedConceptId: e.target.checked ? activeConcept.id : undefined })
            }
            className="accent-primary"
          />
          Link to active concept (optional) — Language Acquisition works with any recording
        </label>
      )}
      <div className="mt-2">
        <Textarea
          value={segment.notes ?? ''}
          onChange={(e) => onUpdate({ notes: e.target.value || undefined })}
          placeholder="Harmonic context, voicing notes…"
          rows={2}
          className="text-sm"
        />
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  compact,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  compact?: boolean
}) {
  return (
    <div>
      <label className={cn('mb-1 block font-medium text-muted-foreground', compact ? 'text-[10px]' : 'text-sm')}>
        {label}
      </label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={compact ? 'h-8 text-sm' : ''} />
    </div>
  )
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (seconds: number) => void
}) {
  const [text, setText] = useState(formatTimestamp(value))

  useEffect(() => {
    setText(formatTimestamp(value))
  }, [value])

  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium text-muted-foreground">{label}</label>
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          const parsed = parseTimeInput(text)
          if (parsed != null) {
            onChange(parsed)
            setText(formatTimestamp(parsed))
          } else {
            setText(formatTimestamp(value))
          }
        }}
        placeholder="1:30"
        className="h-8 font-mono text-sm"
      />
    </div>
  )
}
