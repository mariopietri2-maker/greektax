"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, saveCalculation } from "@/lib/supabase/calcs";

interface SaveButtonProps {
  tool: string;
  title: string;
  data: Record<string, unknown>;
  className?: string;
}

export function SaveButton({ tool, title, data, className }: SaveButtonProps) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onSave = async () => {
    setState("saving");
    const user = await getCurrentUser();
    if (!user) {
      router.push("/login?redirected=1");
      return;
    }
    const res = await saveCalculation(tool, title, data);
    startTransition(() => {
      if (res.ok) {
        setState("saved");
        setMsg("✓ Αποθηκεύτηκε");
      } else {
        setState("error");
        setMsg(res.error ?? "Αποτυχία");
      }
      router.refresh();
    });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        type="button"
        className={`btn btn-ghost ${className ?? ""}`}
        onClick={onSave}
        disabled={isPending || state === "saving" || state === "saved"}
        style={{ padding: "8px 16px", fontSize: 14 }}
      >
        {state === "saved" ? "✓ Αποθηκεύτηκε" : state === "saving" ? "Αποθήκευση…" : "💾 Αποθήκευση"}
      </button>
      {state === "error" && <span className="pill pill-bad">{msg}</span>}
    </div>
  );
}