import { Footer } from "@/components/footer"
import { StringGen } from "@/components/string-gen"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col p-6">
      {/* Main content */}
      <main className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-center">Password Generator</CardTitle>
          </CardHeader>

          <CardContent>
            <StringGen />
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mx-auto text-sm leading-loose">
        <Footer />
      </footer>
    </div>
  )
}
