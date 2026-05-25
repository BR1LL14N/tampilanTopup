import { 
  Swords, 
  Flame, 
  Target, 
  Crosshair, 
  Sparkles, 
  Crown, 
  Boxes, 
  Gamepad2, 
  Video, 
  Radio,
} from "lucide-react"

interface GameIconProps {
  slug: string
  className?: string
}

export function GameIcon({ slug, className = "h-5 w-5" }: GameIconProps) {
  // Normalize slug to handle potential subcategories or items
  const cleanSlug = slug.toLowerCase()

  switch (cleanSlug) {
    case "mobile-legends":
      return <Swords className={className} />
    case "free-fire":
      return <Flame className={className} />
    case "pubg-mobile":
      return <Target className={className} />
    case "valorant":
      return <Crosshair className={className} />
    case "genshin-impact":
      return <Sparkles className={className} />
    case "honor-of-kings":
      return <Crown className={className} />
    case "roblox":
      return <Boxes className={className} />
    case "steam":
      return <Gamepad2 className={className} />
    case "tiktok":
      return <Video className={className} />
    case "bigo":
      return <Radio className={className} />
    default:
      return <Gamepad2 className={className} />
  }
}
