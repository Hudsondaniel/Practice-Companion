import { Link } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Maximize2 } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist'
import { SessionAdherenceCard } from '@/components/dashboard/SessionAdherenceCard'
import { AdherenceCoachingCard } from '@/components/dashboard/AdherenceCoachingCard'
import { PracticeMonthView } from '@/components/dashboard/PracticeMonthView'
import { WeekContextBar } from '@/components/dashboard/WeekContextBar'
import { MonthRolloverBanner } from '@/components/month/MonthRolloverBanner'
import { useStreakStore } from '@/stores/streak-store'
import { usePracticeStore } from '@/stores/practice-store'
import { useGuidedSessionStore } from '@/stores/guided-session-store'
import { useTranscriptionStore } from '@/stores/transcription-store'
import { useAdherenceStore } from '@/stores/adherence-store'
import { currentMonthYear } from '@/types/practice-method'
import { APP_TAGLINE, CONCEPT_STAGE_LABELS } from '@/lib/app-config'
import { formatTime } from '@/lib/utils'
import { isPracticeDay } from '@/lib/month-context'
import { getWeekOfPracticeMonth } from '@/lib/practice-week'

export function Dashboard() {
  const { activeConcept, todaySession, monthlyPlan, ensureTodaySession, practiceSchedule } =
    usePracticeStore()
  const isMonthConfigured = usePracticeStore((s) => s.isMonthConfigured)
  const monthReady = isMonthConfigured(currentMonthYear())
  const setupComplete = monthReady && Boolean(activeConcept)
  const practiceDays = useStreakStore((s) => s.practiceDays)
  const getCurrentStreak = useStreakStore((s) => s.getCurrentStreak)
  const history = useAdherenceStore((s) => s.history)
  const transcriptionProjects = useTranscriptionStore((s) => s.projects)
  const { getDailyElapsedSeconds } = useGuidedSessionStore()

  useEffect(() => {
    if (setupComplete) ensureTodaySession()
  }, [ensureTodaySession, setupComplete])

  const currentStreak = useMemo(() => getCurrentStreak(), [getCurrentStreak, practiceDays, practiceSchedule])
  const showStartSession = isPracticeDay()
  const practiceWeek = getWeekOfPracticeMonth()

  const monthlyTranscription = useMemo(() => {
    const month = currentMonthYear()
    return (
      transcriptionProjects.find((p) => p.id === monthlyPlan?.transcriptionProjectId) ??
      transcriptionProjects.find((p) => p.monthYear === month && !p.practiceDate)
    )
  }, [transcriptionProjects, monthlyPlan?.transcriptionProjectId])

  const adherenceChart = useMemo(() => {
    return history.slice(0, 7).reverse().map((h, i) => ({
      label: `S${i + 1}`,
      score: h.adherenceScore,
      date: h.date,
    }))
  }, [history])

  const completedBlocks = todaySession?.blocks.filter((b) => b.completed).length ?? 0
  const totalBlocks = todaySession?.blocks.length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-heading">Dashboard</h1>
          <p className="text-muted-foreground">{APP_TAGLINE}</p>
        </div>
        <Button asChild size="lg" className="gap-2" disabled={setupComplete && !showStartSession}>
          <Link to={setupComplete ? '/practice' : '/library?tab=monthly'}>
            <Maximize2 className="h-4 w-4" />
            {!setupComplete
              ? 'Set up practice plan'
              : showStartSession
                ? 'Start Guided Session'
                : 'Rest day'}
          </Link>
        </Button>
      </div>

      <MonthRolloverBanner />
      <OnboardingChecklist />

      {!setupComplete ? null : (
        <>
          <WeekContextBar />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <StatCard label="Practice streak" value={`${currentStreak} days`} accent />
            {showStartSession && totalBlocks > 0 && (
              <StatCard label="Today's blocks" value={`${completedBlocks}/${totalBlocks}`} />
            )}
            <StatCard label="Practice month week" value={`Week ${practiceWeek}`} />
            {getDailyElapsedSeconds() > 0 && (
              <StatCard label="Session time today" value={formatTime(getDailyElapsedSeconds())} />
            )}
          </div>

          <PracticeMonthView />

          <div className="grid gap-4 lg:grid-cols-2">
            <SessionAdherenceCard />
            <AdherenceCoachingCard />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Active concept</CardTitle>
                <CardDescription>Retrieval-sized · one device at a time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeConcept ? (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{activeConcept.label}</p>
                      <Badge variant="warning">
                        {CONCEPT_STAGE_LABELS[activeConcept.stage]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{activeConcept.harmonicContext}</p>
                    <div className="flex flex-wrap gap-1">
                      {activeConcept.keyFocusCluster.map((k) => (
                        <Badge key={k} variant="secondary">
                          {k}
                        </Badge>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Pass days toward retirement</span>
                        <span>{activeConcept.consecutivePassDays}/3</span>
                      </div>
                      <Progress value={(activeConcept.consecutivePassDays / 3) * 100} />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Set an active concept in Practice Library.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly transcription</CardTitle>
                <CardDescription>Sections you&apos;re working through this month</CardDescription>
              </CardHeader>
              <CardContent>
                {!monthlyTranscription ? (
                  <p className="text-sm text-muted-foreground">
                    Set your monthly transcription song in{' '}
                    <Link to="/library?tab=monthly" className="text-primary hover:underline">
                      Monthly Setup
                    </Link>
                    .
                  </p>
                ) : monthlyTranscription.segments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{monthlyTranscription.artist} — {monthlyTranscription.title}</span>
                    <br />
                    Add sections during guided practice.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {monthlyTranscription.segments.slice(0, 7).map((s) => (
                      <li key={s.id} className="flex justify-between text-sm">
                        <span className="font-medium">{s.label}</span>
                        <span className="text-xs capitalize text-muted-foreground">{s.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Button variant="ghost" className="mt-2 h-auto p-0 text-xs text-primary" asChild>
                  <Link to="/transcriptions">All transcriptions →</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {adherenceChart.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Session adherence (recent)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={adherenceChart}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" className="text-muted-foreground" fontSize={12} />
                    <YAxis domain={[0, 100]} className="text-muted-foreground" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-foreground)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="var(--color-primary)"
                      fill="color-mix(in srgb, var(--color-primary) 20%, transparent)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {monthlyPlan && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly tune lab</CardTitle>
                <CardDescription>{monthlyPlan.monthYear}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {monthlyPlan.tunes.map((t) => (
                  <Badge key={t.id} variant="secondary">
                    {t.title} ({t.deploymentPoints.length} points)
                  </Badge>
                ))}
                <Button variant="ghost" className="h-auto p-0 text-xs text-primary" asChild>
                  <Link to="/library">Edit tunes →</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold ${accent ? 'text-primary' : ''}`}>{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
