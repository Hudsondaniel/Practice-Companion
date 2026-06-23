import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PRACTICE_BLOCKS, currentMonthYear, type BacklogTier } from '@/types/practice-method'
import { CONCEPT_STAGE_LABELS } from '@/lib/app-config'
import { EMPTY } from '@/lib/copy'
import { getMonthlyTranscriptionLabel, syncMonthlyTranscriptionProject } from '@/lib/monthly-transcription'
import { parseRecordingUrl } from '@/lib/recording-url'
import { usePracticeStore } from '@/stores/practice-store'
import { useTranscriptionStore } from '@/stores/transcription-store'
import { cn } from '@/lib/utils'
import { MonthlyTunesPanel } from '@/components/practice-library/MonthlyTunesPanel'
import { MonthControls } from '@/components/month/MonthControls'
import { MonthRolloverBanner } from '@/components/month/MonthRolloverBanner'

type Tab = 'monthly' | 'tunes' | 'concepts' | 'blocks'

function newDeploymentPointId(): string {
  return `dp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

interface TuneFormState {
  title: string
  key: string
  barRange: string
  chordFunction: string
}

export function PracticeLibrary() {
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const initialTab: Tab =
    tabParam === 'monthly' || tabParam === 'tunes' || tabParam === 'concepts' || tabParam === 'blocks'
      ? tabParam
      : 'monthly'
  const [tab, setTab] = useState<Tab>(initialTab)
  const {
    deviceBacklog,
    monthlyTunes,
    monthlyPlan,
    activeConcept,
    isMonthConfigured,
    configureMonth,
    addBacklogItem,
    deleteBacklogItem,
    activateConcept,
    setBacklogTier,
    retireConcept,
    incrementPassDays,
    updateConceptStage,
  } = usePracticeStore()

  const month = currentMonthYear()
  const configured = isMonthConfigured(month)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-heading">Practice Library</h1>
        <p className="text-muted-foreground">Monthly setup, concepts, and repertoire</p>
      </div>

      <div className="flex gap-2 border-b border-border pb-2">
        {(['monthly', 'tunes', 'concepts', 'blocks'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'rounded-md px-4 py-2 text-sm capitalize transition-colors',
              tab === t ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {t === 'monthly' ? 'Monthly Setup' : t === 'tunes' ? 'Monthly Tunes' : t}
          </button>
        ))}
      </div>

      <MonthRolloverBanner />

      {tab === 'monthly' && (
        <>
          <MonthControls />
          <MonthlySetupForm
            month={month}
            configured={configured}
            existingPlan={monthlyPlan}
            onSave={(plan) => {
              configureMonth(plan)
              toast.success(`Month ${month} configured. Ready to practice.`)
            }}
          />
        </>
      )}

      {tab === 'tunes' && <MonthlyTunesPanel />}

      {tab === 'concepts' && (
        <ConceptsPanel
          backlog={deviceBacklog}
          activeConcept={activeConcept}
          onAdd={addBacklogItem}
          onDelete={deleteBacklogItem}
          onActivate={activateConcept}
          onSetTier={setBacklogTier}
          onRetire={retireConcept}
          onIncrementPass={incrementPassDays}
          onUpdateStage={updateConceptStage}
        />
      )}

      {tab === 'blocks' && (
        <>
          {!configured && (
            <Card className="border-warning/50">
              <CardContent className="py-4 text-sm text-warning">
                Complete{' '}
                <button type="button" className="underline" onClick={() => setTab('monthly')}>
                  Monthly Setup
                </button>{' '}
                before starting guided sessions.
              </CardContent>
            </Card>
          )}
          <section>
            <h2 className="mb-3 text-xl font-semibold">Daily Blocks</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {PRACTICE_BLOCKS.filter((b) => b.id !== 'recording-review').map((block) => (
                <Card key={block.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{block.name}</CardTitle>
                      <Badge>{block.durationMinutes} min</Badge>
                    </div>
                    <CardDescription>{block.focus}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{block.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
          {configured && (
            <section>
              <h2 className="mb-3 text-xl font-semibold">This Month&apos;s Tunes</h2>
              <div className="grid gap-3 md:grid-cols-3">
                {monthlyTunes.map((tune) => (
                  <Card key={tune.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{tune.title}</CardTitle>
                      <CardDescription>
                        {tune.key || 'Key not set'} · {tune.type}
                        {tune.deploymentPoints.length > 0 &&
                          ` · ${tune.deploymentPoints.length} deployment point${tune.deploymentPoints.length !== 1 ? 's' : ''}`}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function tuneFromPlan(
  existingPlan: ReturnType<typeof usePracticeStore.getState>['monthlyPlan'],
  index: 0 | 1 | 2,
): TuneFormState {
  const tune = existingPlan?.tunes[index]
  const firstDp = tune?.deploymentPoints[0]
  return {
    title: tune?.title ?? '',
    key: tune?.key && tune.key !== EMPTY ? tune.key : '',
    barRange: firstDp?.barRange ?? '',
    chordFunction: firstDp?.chordFunction ?? '',
  }
}

function MonthlySetupForm({
  month,
  configured,
  existingPlan,
  onSave,
}: {
  month: string
  configured: boolean
  existingPlan: ReturnType<typeof usePracticeStore.getState>['monthlyPlan']
  onSave: (plan: Parameters<ReturnType<typeof usePracticeStore.getState>['configureMonth']>[0]) => void
}) {
  const { deviceBacklog } = usePracticeStore()
  const transcriptionProjects = useTranscriptionStore((s) => s.projects)
  const currentConcept = deviceBacklog.find((i) => i.tier === 'current')

  const linkedProject = existingPlan?.transcriptionProjectId
    ? transcriptionProjects.find((p) => p.id === existingPlan.transcriptionProjectId)
    : transcriptionProjects.find((p) => p.monthYear === month && !p.practiceDate)

  const [tune1, setTune1] = useState<TuneFormState>(() => tuneFromPlan(existingPlan, 0))
  const [tune2, setTune2] = useState<TuneFormState>(() => tuneFromPlan(existingPlan, 1))
  const [tune3, setTune3] = useState<TuneFormState>(() => tuneFromPlan(existingPlan, 2))
  const [tune3Type, setTune3Type] = useState<'hymn' | 'standard'>(
    existingPlan?.tunes[2]?.type === 'standard' ? 'standard' : 'hymn',
  )
  const [keys, setKeys] = useState(existingPlan?.keyFocusCluster.join(', ') ?? '')
  const [dualPhase, setDualPhase] = useState<1 | 2 | 3>(existingPlan?.dualTaskPhase ?? 1)
  const [heroes, setHeroes] = useState(existingPlan?.heroPianists.join(', ') ?? '')
  const [transArtist, setTransArtist] = useState(linkedProject?.artist ?? '')
  const [transTitle, setTransTitle] = useState(linkedProject?.title ?? '')
  const [transUrl, setTransUrl] = useState(linkedProject?.recordingUrl ?? '')
  const [transKey, setTransKey] = useState(linkedProject?.key ?? '')

  const buildTune = (
    form: TuneFormState,
    id: string,
    type: 'standard' | 'hymn',
    existingPoints: ReturnType<typeof usePracticeStore.getState>['monthlyTunes'][0]['deploymentPoints'],
  ) => {
    const deploymentPoints = [...existingPoints]
    if (form.barRange.trim() && form.chordFunction.trim()) {
      const first = deploymentPoints[0]
      if (first) {
        deploymentPoints[0] = {
          ...first,
          barRange: form.barRange.trim(),
          chordFunction: form.chordFunction.trim(),
        }
      } else {
        deploymentPoints.push({
          id: newDeploymentPointId(),
          barRange: form.barRange.trim(),
          chordFunction: form.chordFunction.trim(),
        })
      }
    }
    return {
      id,
      title: form.title.trim(),
      type,
      key: form.key.trim() || EMPTY,
      monthYear: month,
      deploymentPoints,
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const keyCluster = keys
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
    if (keyCluster.length < 2) {
      toast.error('Enter at least 2 keys for your focus cluster')
      return
    }
    if (!tune1.title.trim() || !tune2.title.trim() || !tune3.title.trim()) {
      toast.error('Enter all three tune titles')
      return
    }
    if (!transArtist.trim() || !transTitle.trim() || !transUrl.trim()) {
      toast.error('Monthly transcription song requires artist, title, and recording link')
      return
    }
    const parsed = parseRecordingUrl(transUrl)
    if (parsed.type === 'unknown') {
      toast.error('Unsupported recording link. Use YouTube, SoundSlice, or a direct audio URL.')
      return
    }

    const transcriptionProjectId = syncMonthlyTranscriptionProject({
      artist: transArtist.trim(),
      title: transTitle.trim(),
      recordingUrl: transUrl.trim(),
      key: transKey.trim() || undefined,
      monthYear: month,
      existingProjectId: existingPlan?.transcriptionProjectId ?? linkedProject?.id,
    })

    onSave({
      monthYear: month,
      keyFocusCluster: keyCluster,
      dualTaskPhase: dualPhase,
      transcriptionProject: getMonthlyTranscriptionLabel(transArtist.trim(), transTitle.trim()),
      transcriptionProjectId,
      heroPianists: heroes
        .split(',')
        .map((h) => h.trim())
        .filter(Boolean),
      reviewDay: 0,
      tunes: [
        buildTune(tune1, existingPlan?.tunes[0]?.id ?? 't1', 'standard', existingPlan?.tunes[0]?.deploymentPoints ?? []),
        buildTune(tune2, existingPlan?.tunes[1]?.id ?? 't2', 'standard', existingPlan?.tunes[1]?.deploymentPoints ?? []),
        buildTune(tune3, existingPlan?.tunes[2]?.id ?? 't3', tune3Type, existingPlan?.tunes[2]?.deploymentPoints ?? []),
      ],
      extendedWeek: existingPlan?.extendedWeek,
      monthStartedAt: existingPlan?.monthStartedAt ?? new Date().toISOString().split('T')[0]!,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Initialize {month}</CardTitle>
        <CardDescription>
          Lock your 3-tune lab, monthly transcription song, keys, and deployment points. Add more
          transcription sections during guided sessions.
        </CardDescription>
        {configured && <Badge variant="success">Configured</Badge>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-md border border-border bg-muted/20 p-3 text-sm">
            <span className="text-muted-foreground">Active concept: </span>
            <strong>{currentConcept?.label ?? 'Set in Concepts tab'}</strong>
          </div>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Monthly tunes</h3>
            <TuneFields
              label="Standard 1"
              value={tune1}
              onChange={setTune1}
            />
            <TuneFields
              label="Standard 2"
              value={tune2}
              onChange={setTune2}
            />
            <div className="space-y-3 rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-medium">
                  {tune3Type === 'hymn' ? 'Hymn 3' : 'Standard 3'}
                </h4>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={tune3Type === 'hymn' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTune3Type('hymn')}
                  >
                    Hymn
                  </Button>
                  <Button
                    type="button"
                    variant={tune3Type === 'standard' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTune3Type('standard')}
                  >
                    Standard
                  </Button>
                </div>
              </div>
              <TuneFields label="" value={tune3} onChange={setTune3} hideTitleLabel />
            </div>
          </section>

          <Field
            label="Key focus cluster (comma-separated)"
            value={keys}
            onChange={setKeys}
            placeholder="C, Db, D"
          />

          <section className="space-y-3 rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold">Monthly transcription song</h3>
            <p className="text-xs text-muted-foreground">
              One recording for the whole month. You&apos;ll add sections to transcribe during guided
              practice — not a new song every day.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Artist" value={transArtist} onChange={setTransArtist} placeholder="Oscar Peterson" />
              <Field label="Tune / title" value={transTitle} onChange={setTransTitle} placeholder="C Jam Blues" />
            </div>
            <Field
              label="Recording link"
              value={transUrl}
              onChange={setTransUrl}
              placeholder="YouTube, SoundSlice, or direct audio URL"
            />
            <Field label="Key (optional)" value={transKey} onChange={setTransKey} placeholder="F blues" />
          </section>

          <Field label="Hero pianists (comma-separated)" value={heroes} onChange={setHeroes} />

          <div>
            <label className="mb-1 block text-sm font-medium">Dual-task phase (week 1)</label>
            <select
              value={dualPhase}
              onChange={(e) => setDualPhase(Number(e.target.value) as 1 | 2 | 3)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value={1}>Phase 1: count aloud</option>
              <option value={2}>Phase 2: count + foot tap</option>
              <option value={3}>Phase 3: name deployment points</option>
            </select>
          </div>

          <Button type="submit">{configured ? 'Update month plan' : 'Initialize month'}</Button>
        </form>
      </CardContent>
    </Card>
  )
}

function TuneFields({
  label,
  value,
  onChange,
  hideTitleLabel,
}: {
  label: string
  value: TuneFormState
  onChange: (v: TuneFormState) => void
  hideTitleLabel?: boolean
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-2">
      {label && !hideTitleLabel && (
        <p className="text-sm font-medium md:col-span-2">{label}</p>
      )}
      <Field
        label="Title"
        value={value.title}
        onChange={(title) => onChange({ ...value, title })}
        placeholder="Autumn Leaves"
      />
      <Field
        label="Key"
        value={value.key}
        onChange={(key) => onChange({ ...value, key })}
        placeholder="Bb"
      />
      <Field
        label="Deployment bar range"
        value={value.barRange}
        onChange={(barRange) => onChange({ ...value, barRange })}
        placeholder="mm. 17–20"
      />
      <Field
        label="Chord function at deployment"
        value={value.chordFunction}
        onChange={(chordFunction) => onChange({ ...value, chordFunction })}
        placeholder="ii–V–I"
      />
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      {label ? <label className="mb-1 block text-sm font-medium">{label}</label> : null}
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function ConceptsPanel({
  backlog,
  activeConcept,
  onAdd,
  onDelete,
  onActivate,
  onSetTier,
  onRetire,
  onIncrementPass,
  onUpdateStage,
}: {
  backlog: ReturnType<typeof usePracticeStore.getState>['deviceBacklog']
  activeConcept: ReturnType<typeof usePracticeStore.getState>['activeConcept']
  onAdd: ReturnType<typeof usePracticeStore.getState>['addBacklogItem']
  onDelete: ReturnType<typeof usePracticeStore.getState>['deleteBacklogItem']
  onActivate: ReturnType<typeof usePracticeStore.getState>['activateConcept']
  onSetTier: ReturnType<typeof usePracticeStore.getState>['setBacklogTier']
  onRetire: ReturnType<typeof usePracticeStore.getState>['retireConcept']
  onIncrementPass: ReturnType<typeof usePracticeStore.getState>['incrementPassDays']
  onUpdateStage: ReturnType<typeof usePracticeStore.getState>['updateConceptStage']
}) {
  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [harmonic, setHarmonic] = useState('')
  const [keys, setKeys] = useState('')
  const [tier, setTier] = useState<BacklogTier>('future')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    onAdd({
      label: label.trim(),
      description: description.trim(),
      harmonicContext: harmonic.trim(),
      keys: keys.split(',').map((k) => k.trim()).filter(Boolean),
      tier,
    })
    toast.success('Added to concept library')
    setLabel('')
    setDescription('')
    setHarmonic('')
    setKeys('')
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      {activeConcept && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="text-base">Active Concept</CardTitle>
            <CardDescription>{activeConcept.harmonicContext}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-medium">{activeConcept.label}</p>
            <div className="flex flex-wrap gap-2">
              <Badge>{activeConcept.stage}</Badge>
              <Badge variant="outline">{activeConcept.consecutivePassDays}/3 pass days</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onIncrementPass()}>
                +1 pass day
              </Button>
              <select
                value={activeConcept.stage}
                onChange={(e) => onUpdateStage(e.target.value as typeof activeConcept.stage)}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs"
              >
                <option value="cognitive">{CONCEPT_STAGE_LABELS.cognitive}</option>
                <option value="associative">{CONCEPT_STAGE_LABELS.associative}</option>
                <option value="automatic">{CONCEPT_STAGE_LABELS.automatic}</option>
              </select>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (window.confirm('Retire this concept and promote Next from backlog?')) {
                    onRetire()
                    toast.success('Concept retired. Next promoted.')
                  }
                }}
              >
                Retire concept
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Promotion gates: 3 consecutive pass days · dual-task Phase 3 · cold deployment · sound-target
              review. Stage: cognitive → associative → automatic.
            </p>
            {activeConcept.consecutivePassDays >= 3 && activeConcept.dualTaskPhase >= 3 && (
              <p className="text-xs font-medium text-success">
                Eligible for retirement — confirm automaticity criteria met.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">Concept library</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add concept'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleAdd} className="space-y-3">
              <Input
                placeholder="Label (retrieval-sized, one line)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
              />
              <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Input placeholder="Harmonic context (e.g. V7 in ii–V–I)" value={harmonic} onChange={(e) => setHarmonic(e.target.value)} />
              <Input placeholder="Keys: C, F, Bb" value={keys} onChange={(e) => setKeys(e.target.value)} />
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as BacklogTier)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="future">Future</option>
                <option value="next">Next</option>
                <option value="current">Current (sets as active)</option>
              </select>
              <Button type="submit">Add to backlog</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {backlog.length === 0 && !showForm && (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              No concepts yet. Add one harmonic device to drill in your guided sessions.
            </CardContent>
          </Card>
        )}
        {backlog.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.harmonicContext}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={item.tier === 'current' ? 'default' : item.tier === 'next' ? 'warning' : 'secondary'}>
                  {item.tier}
                </Badge>
                {activeConcept?.id !== item.id && (
                  <Button size="sm" variant="outline" onClick={() => onActivate(item.id)}>
                    Set active
                  </Button>
                )}
                {item.tier === 'future' && (
                  <Button size="sm" variant="ghost" onClick={() => onSetTier(item.id, 'next')}>
                    → Next
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => {
                    if (window.confirm(`Delete "${item.label}" from backlog?`)) {
                      onDelete(item.id)
                      toast.success('Concept removed')
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
