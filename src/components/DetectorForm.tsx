import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Upload, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { VerdictCard, type VerdictResult } from "./VerdictCard";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const DetectorForm = () => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerdictResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error("Image must be under 8 MB.");
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) acceptFile(f);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) acceptFile(f);
  };

  const removeFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onSubmit = async () => {
    if (!file) return toast.error("Please attach an image.");
    if (text.trim().length < 3) return toast.error("Please enter the news text.");

    setLoading(true);
    setResult(null);
    try {
      const imageBase64 = await fileToBase64(file);
      const { data, error } = await supabase.functions.invoke("detect-fake-news", {
        body: { text, imageBase64, imageMimeType: file.type },
      });

      if (error) {
        // Edge function returned non-2xx — try to surface the message.
        const msg = (data as { error?: string } | null)?.error ?? error.message ?? "Analysis failed.";
        toast.error(msg);
        return;
      }
      if ((data as { error?: string })?.error) {
        toast.error((data as { error: string }).error);
        return;
      }
      setResult(data as VerdictResult);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Form */}
      <div className="lg:col-span-3 space-y-6">
        <div className="rounded-lg border border-border bg-card shadow-paper p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-3">
              Step 1 — News Image
            </label>
            {preview ? (
              <div className="relative rounded-md overflow-hidden border border-border bg-muted">
                <img src={preview} alt="Uploaded news" className="w-full max-h-80 object-contain bg-background" />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-2 right-2 rounded-full bg-background/90 hover:bg-background border border-border p-1.5 transition-smooth"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`cursor-pointer rounded-md border-2 border-dashed transition-smooth p-8 text-center ${
                  dragOver
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent hover:bg-muted/50"
                }`}
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium text-foreground">Click to upload or drag & drop</p>
                <p className="text-sm text-muted-foreground mt-1">PNG, JPG, or WEBP — up to 8 MB</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="news-text" className="block text-xs uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-3">
              Step 2 — News Text or Caption
            </label>
            <Textarea
              id="news-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the headline, caption, or article snippet (any language)..."
              className="min-h-[140px] resize-y bg-background"
              maxLength={4000}
            />
            <p className="text-xs text-muted-foreground mt-2 text-right tabular-nums">{text.length} / 4000</p>
          </div>

          <Button
            onClick={onSubmit}
            disabled={loading || !file || text.trim().length < 3}
            size="lg"
            className="w-full bg-primary hover:bg-primary-glow text-primary-foreground font-semibold tracking-wide transition-smooth"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Analyzing across languages & visuals...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Analyze with XFake
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Result */}
      <div className="lg:col-span-2">
        {result ? (
          <VerdictCard result={result} />
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center h-full flex flex-col justify-center">
            <div className="font-serif text-2xl text-foreground/60 italic mb-2">Awaiting Analysis</div>
            <p className="text-sm text-muted-foreground">
              Your verdict will appear here, with confidence, detected language, and the signals XFake found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
