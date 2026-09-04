import { ScenesWorkspace } from "@/components/scenes/scenes-workspace";
import { UnavailableNotice } from "@/components/ui/unavailable-notice";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ScenesPage({
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
          message="Continue from the script workspace after generating a script."
        />
        <Button asChild>
          <Link href="/create">Go to Create</Link>
        </Button>
      </div>
    );
  }

  return <ScenesWorkspace videoId={params.id} />;
}
