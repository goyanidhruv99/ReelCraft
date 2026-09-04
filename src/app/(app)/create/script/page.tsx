import { ScriptWorkspace } from "@/components/create/script-workspace";
import { UnavailableNotice } from "@/components/ui/unavailable-notice";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ScriptPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;

  if (!params.id) {
    return (
      <div className="space-y-4">
        <UnavailableNotice
          variant="warning"
          title="Missing draft"
          message="Open a video from My Videos or create a new draft from Create Video."
        />
        <Button asChild>
          <Link href="/create">Go to Create</Link>
        </Button>
      </div>
    );
  }

  return <ScriptWorkspace videoId={params.id} />;
}
