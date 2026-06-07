/** MediaPipe Pose posture analysis — simplified scoring model */

export interface PostureMetrics {
  benchHeight: number
  keyboardDistance: number
  backAngle: number
  shoulderTension: number
  headPosition: number
  wristAlignment: number
  elbowHeight: number
}

export interface PostureAnalysis {
  score: number
  metrics: PostureMetrics
  warnings: string[]
  recommendations: string[]
}

interface Landmark {
  x: number
  y: number
  z: number
  visibility?: number
}

/** Analyze pose landmarks from MediaPipe — values 0-100 */
export function analyzePosture(landmarks: Landmark[]): PostureAnalysis {
  const warnings: string[] = []
  const recommendations: string[] = []

  const leftShoulder = landmarks[11]
  const rightShoulder = landmarks[12]
  const leftElbow = landmarks[13]
  const leftWrist = landmarks[15]
  const rightWrist = landmarks[16]
  const nose = landmarks[0]

  if (!leftShoulder || !rightShoulder || !leftElbow || !leftWrist || !nose) {
    return {
      score: 0,
      metrics: {
        benchHeight: 0,
        keyboardDistance: 0,
        backAngle: 0,
        shoulderTension: 0,
        headPosition: 0,
        wristAlignment: 0,
        elbowHeight: 0,
      },
      warnings: ['Unable to detect pose — ensure full upper body is visible'],
      recommendations: ['Adjust webcam angle to capture shoulders, arms, and head'],
    }
  }

  const shoulderSlope = Math.abs(leftShoulder.y - rightShoulder.y)
  const elbowHeight = leftElbow.y < leftShoulder.y ? 85 : 55
  const wristFlat =
    leftWrist && rightWrist && Math.abs(leftWrist.y - leftElbow.y) < 0.08 ? 90 : 60
  const backAngle = 75 + (1 - shoulderSlope) * 20
  const headForward = nose.z > leftShoulder.z ? 55 : 88

  if (shoulderSlope > 0.05) {
    warnings.push('Shoulders uneven — check bench height')
    recommendations.push('Level bench; sit centered on seat')
  }
  if (elbowHeight < 70) {
    warnings.push('Elbows too low — may cause wrist collapse')
    recommendations.push('Raise bench or adjust distance from keyboard')
  }
  if (wristFlat < 75) {
    warnings.push('Wrist alignment compromised')
    recommendations.push('Keep forearm, wrist, and hand in a straight line')
  }
  if (headForward < 70) {
    warnings.push('Head leaning forward')
    recommendations.push('Align head over spine; reduce screen lean')
  }

  const metrics: PostureMetrics = {
    benchHeight: Math.round(80 + (1 - shoulderSlope) * 15),
    keyboardDistance: Math.round(75),
    backAngle: Math.round(Math.min(100, backAngle)),
    shoulderTension: Math.round(100 - shoulderSlope * 500),
    headPosition: Math.round(headForward),
    wristAlignment: Math.round(wristFlat),
    elbowHeight: Math.round(elbowHeight),
  }

  const score = Math.round(
    Object.values(metrics).reduce((a, b) => a + b, 0) / Object.keys(metrics).length,
  )

  return { score, metrics, warnings, recommendations }
}
