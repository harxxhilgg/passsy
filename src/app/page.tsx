import { Footer } from "@/components/footer";
import { SavedList } from "@/components/saved-passwords/saved-list";
import { SavedListRefreshButton } from "@/components/saved-passwords/saved-list-refresh-button";
import { SavedListFavoriteFilter } from "@/components/saved-passwords/saved-list-favorite-filter";
import { TotalSavedCount } from "@/components/saved-passwords/total-saved-count";
import { StringGen } from "@/components/string-gen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserPasswordsAction } from "./actions/passwords";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { records = [] } = await getUserPasswordsAction();

  return (
    <div className="flex min-h-svh flex-col p-6">
      <main className="flex flex-1 flex-col items-center gap-6 pt-10 sm:pt-6">
        <Card className="w-full max-w-lg">
          <CardContent className="mt-4">
            <StringGen />
          </CardContent>
        </Card>

        <Card className="w-full max-w-lg">
          <CardHeader className="flex flex-row items-center justify-between px-6">
            <CardTitle className="font-serif text-2xl">
              Saved Passwords
            </CardTitle>

            <div className="flex items-center gap-1.5 text-sm font-normal text-muted-foreground">
              <span>Total saved:</span>

              <TotalSavedCount />
              <SavedListFavoriteFilter />
              <SavedListRefreshButton />
            </div>
          </CardHeader>

          <CardContent>
            <SavedList initialRecords={records} />
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
