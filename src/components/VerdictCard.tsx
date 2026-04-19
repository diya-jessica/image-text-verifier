import { CheckCircle2, AlertTriangle, Languages, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type VerdictResult = {
  verdict: "REAL" | "FAKE";
  confidence: number;
  detected_language: string;
  reasoning: string;
  red_flags: string[];
  image_text_consistency: "consistent" | "partially_consistent" | "inconsistent";
};

const consistencyLabel: Record<VerdictResult["image_text_consistency"], string> = {
  consistent: "Image matches the claim",
  partially_consistent: "Partial match",
  inconsistent: "Image conflicts with the claim",
};

export const VerdictCard = ({ result }: { result: VerdictResult }) => {
  const isReal = result.verdict === "REAL";
  const Icon = isReal ? CheckCircle2 : AlertTriangle;
  const pct = Math.round(result.confidence * 100);

  return (
    <article className="animate-fade-in-up rounded-lg border border-border bg-card shadow-elevated overflow-hidden">
      <header
        className={cn(
          "flex items-center gap-4 px-6 py-5 border-b border-border",
          isReal ? "bg-[hsl(var(--verdict-real))]" : "bg-[hsl(var(--verdict-fake))]",
        )}
      >
        <Icon
          className={cn(
            "h-10 w-10 shrink-0 animate-stamp",
            isReal ? "text-[hsl(var(--verdict-real-foreground))]" : "text-[hsl(var(--verdict-fake-foreground))]",
          )}
          strokeWidth={2.25}
        />
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-xs uppercase tracking-[0.18em] font-semibold opacity-80",
              isReal ? "text-[hsl(var(--verdict-real-foreground))]" : "text-[hsl(var(--verdict-fake-foreground))]",
            )}
          >
            XFake Verdict
          </p>
          <h2
            className={cn(
              "font-serif text-3xl sm:text-4xl font-bold leading-none mt-1",
              isReal ? "text-[hsl(var(--verdict-real-foreground))]" : "text-[hsl(var(--verdict-fake-foreground))]",
            )}
          >
            {isReal ? "Likely Real" : "Likely Fake"}
          </h2>
        </div>
        <div
          className={cn(
            "text-right",
            isReal ? "text-[hsl(var(--verdict-real-foreground))]" : "text-[hsl(var(--verdict-fake-foreground))]",
          )}
        >
          <div className="text-3xl font-bold tabular-nums leading-none">{pct}%</div>
          <div className="text-[10px] uppercase tracking-wider opacity-80 mt-1">confidence</div>
        </div>
      </header>

      <div className="p-6 space-y-5">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Languages className="h-3.5 w-3.5" />
            {result.detected_language}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <ImageIcon className="h-3.5 w-3.5" />
            {consistencyLabel[result.image_text_consistency]}
          </span>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-2">
            Editor's Note
          </h3>
          <p className="text-foreground leading-relaxed text-balance">{result.reasoning}</p>
        </div>

        {result.red_flags.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-2">
              Signals Detected
            </h3>
            <ul className="space-y-1.5">
              {result.red_flags.map((flag, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <span className="text-[hsl(var(--verdict-fake))] font-bold mt-0.5">·</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-muted-foreground italic border-t border-border pt-4">
          XFake is an AI-assisted screening tool. Always cross-check with reputable sources before sharing.
        </p>
      </div>
    </article>
  );
};
