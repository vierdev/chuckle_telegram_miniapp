declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          start_param?: string
          user?: {
            id: number
            username?: string
            photo_url?: string
          }
          [key: string]: any
        }
        setHeaderColor: (color: string) => void
        ready: () => void
        expand: () => void
        disableVerticalSwipes: () => void
        isVerticalSwipesEnabled: boolean
      }
    }
  }
}

export {};