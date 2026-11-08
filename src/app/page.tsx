import { Footer } from "@/components/footer";
import { StringGen } from "@/components/string-gen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col p-6">
      {/* Main content */}
      <main className="flex flex-1 items-start justify-center pt-6">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle
              className="cursor-default text-center text-lg tracking-wider select-none sm:text-xl"
              title="Passy"
            >
              🎲🔐
            </CardTitle>
          </CardHeader>

          <CardContent className="mt-4">
            <StringGen />
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mx-auto text-sm leading-loose">
        <Footer />
      </footer>
    </div>
  );
}
