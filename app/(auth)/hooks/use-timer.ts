import { useState, useEffect, useCallback } from "react"

export function useTimer(initialTime: number, intervalMilliseconds: number) {
  const [time, setTime] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(true)

  const reset = useCallback(() => {
    setTime(initialTime)
    setIsRunning(true)
  }, [initialTime])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 0) {
          setIsRunning(false)
          return 0
        }
        return prevTime - intervalMilliseconds
      })
    }, intervalMilliseconds)

    return () => clearInterval(interval)
  }, [intervalMilliseconds, isRunning])

  return { 
    time, 
    reset,
    isRunning,
    stop: () => setIsRunning(false),
    start: () => setIsRunning(true)
  }
}

