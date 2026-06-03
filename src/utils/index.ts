export const generateId = () => Math.random().toString(36).substr(2, 9)

export const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export const throttle = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  let lastTime = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn(...args)
    }
  }
}

export const downloadFile = (content: string, filename: string, type: string = 'application/json') => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const uploadFile = async (accept: string = '*'): Promise<File | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = () => {
      const file = input.files?.[0] || null
      resolve(file)
    }
    input.click()
  })
}

export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const parseJsonFile = async (file: File): Promise<any> => {
  const text = await file.text()
  return JSON.parse(text)
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t
}

export const easeInOut = (t: number): number => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

export const easeOut = (t: number): number => {
  return 1 - Math.pow(1 - t, 3)
}

export const easeIn = (t: number): number => {
  return t * t
}

export const getEasingFunction = (type: string) => {
  switch (type) {
    case 'ease-in':
      return easeIn
    case 'ease-out':
      return easeOut
    case 'ease-in-out':
      return easeInOut
    default:
      return (t: number) => t
  }
}

export const getAnimationStyle = (animation: { type: string; duration: number; delay: number; easing: string }) => {
  return {
    animationDuration: `${animation.duration}ms`,
    animationDelay: `${animation.delay}ms`,
    animationTimingFunction: animation.easing,
    animationFillMode: 'forwards' as const
  }
}
