import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { usePracticeStore } from '@/stores/practice-store'
import { useState } from 'react'

export function MonthlyTunesPanel() {
  const { monthlyTunes, updateMonthlyTune, addDeploymentPoint, removeDeploymentPoint } = usePracticeStore()

  if (monthlyTunes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Initialize Monthly Setup first to edit tune deployment points.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Map deployment points for each monthly tune. Guided Standards Lab phases reference these locations.
      </p>
      {monthlyTunes.map((tune) => (
        <TuneEditor
          key={tune.id}
          tune={tune}
          onUpdateKey={(key) => updateMonthlyTune(tune.id, { key })}
          onAddPoint={(barRange, chordFunction) =>
            addDeploymentPoint(tune.id, { barRange, chordFunction })
          }
          onRemovePoint={(pointId) => removeDeploymentPoint(tune.id, pointId)}
        />
      ))}
    </div>
  )
}

function TuneEditor({
  tune,
  onUpdateKey,
  onAddPoint,
  onRemovePoint,
}: {
  tune: ReturnType<typeof usePracticeStore.getState>['monthlyTunes'][0]
  onUpdateKey: (key: string) => void
  onAddPoint: (barRange: string, chordFunction: string) => void
  onRemovePoint: (pointId: string) => void
}) {
  const [barRange, setBarRange] = useState('')
  const [chordFunction, setChordFunction] = useState('')

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{tune.title}</CardTitle>
        <CardDescription className="capitalize">{tune.type}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="block text-xs">
          <span className="mb-1 block font-medium text-muted-foreground">Key</span>
          <Input
            value={tune.key}
            onChange={(e) => onUpdateKey(e.target.value)}
            className="h-8 max-w-[120px] text-sm"
          />
        </label>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Deployment points</p>
          {tune.deploymentPoints.length === 0 ? (
            <p className="text-xs text-muted-foreground">No points mapped yet.</p>
          ) : (
            <ul className="space-y-1">
              {tune.deploymentPoints.map((dp) => (
                <li
                  key={dp.id}
                  className="flex items-center justify-between rounded-md border border-border px-2 py-1.5 text-xs"
                >
                  <span>
                    <strong>{dp.barRange}</strong>
                    <span className="text-muted-foreground"> · {dp.chordFunction}</span>
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemovePoint(dp.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Bar range (e.g. mm. 17-20)"
            value={barRange}
            onChange={(e) => setBarRange(e.target.value)}
            className="h-8 max-w-[160px] text-xs"
          />
          <Input
            placeholder="Chord function"
            value={chordFunction}
            onChange={(e) => setChordFunction(e.target.value)}
            className="h-8 max-w-[160px] text-xs"
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 text-xs"
            disabled={!barRange.trim() || !chordFunction.trim()}
            onClick={() => {
              onAddPoint(barRange.trim(), chordFunction.trim())
              setBarRange('')
              setChordFunction('')
            }}
          >
            <Plus className="h-3 w-3" />
            Add point
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
