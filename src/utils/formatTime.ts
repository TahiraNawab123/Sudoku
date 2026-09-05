/** Formats a duration in seconds as mm:ss (e.g. 65 -> "1:05"). */
export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}