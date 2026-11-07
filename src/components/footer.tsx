import { Kbd } from "./ui/kbd"

export function Footer() {
  return (
    <footer>
      <div className="font-mono text-xs text-muted-foreground">
        <p>
          ( Press <Kbd>D</Kbd> to toggle dark mode )
        </p>
      </div>
    </footer>
  )
}
