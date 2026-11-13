import { NFlowEx } from "@/components/example/nflow-ex";
import { Footer } from "@/components/footer";
import { SavedList } from "@/components/saved-passwords/saved-list";
import { StringGen } from "@/components/string-gen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col p-6">
      <main className="flex flex-1 flex-col items-center gap-6 pt-6">
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

        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-center text-base font-semibold">
              Saved Passwords
            </CardTitle>
          </CardHeader>

          <CardContent>
            <SavedList />
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mx-auto mt-10 text-sm leading-loose">
        <Footer />
      </footer>
    </div>
  );
}
