"use client";

import { useState } from "react";
import { ListPlus, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addWorkflowItem } from "@/lib/api/skills";
import { ApiError } from "@/lib/api/base";

export function AddToWorkflowButton({ skillId }: { skillId: string }) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await addWorkflowItem(skillId);
      setAdded(true);
      toast.success("Added to My Workflow", {
        description: "View and reorder it from the My Workflow tab.",
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="default" size="md" loading={loading} onClick={handleClick} className="w-full">
      {added ? <Check className="h-4 w-4" /> : <ListPlus className="h-4 w-4" />}
      {added ? "Added to Workflow" : "Add to Workflow"}
    </Button>
  );
}
