import { Newspaper, Globe2, ScanEye, ShieldCheck } from "lucide-react";
import { DetectorForm } from "@/components/DetectorForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-paper">
      {/* Masthead */}
      <header className="bg-gradient-hero text-primary-foreground border-b-4 border-double border-primary-foreground/20">
        <div className="container py-10 sm:py-14">
          <div className="flex items-center gap-3 mb-4">
            <Newspaper className="h-6 w-6" />
            <span className="text-xs uppercase tracking-[0.3em] font-semibold opacity-80">
              The Verification Desk · Established 2026
            </span>
          </div>
          <h1 className="font-serif text-5xl sm:text-7xl font-black leading-[0.95] tracking-tight text-balance">
            XFake
          </h1>
          <p className="font-serif text-xl sm:text-2xl italic mt-3 opacity-90 max-w-2xl text-balance">
            CrossLingualVision multi-encoder analysis for accurate fake news detection across multilingual social media.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 max-w-3xl">
            <div className="flex items-start gap-2.5">
              <Globe2 className="h-5 w-5 mt-0.5 opacity-70 shrink-0" />
              <div>
                <div className="text-sm font-semibold">Multilingual</div>
                <div className="text-xs opacity-70">Any language input</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ScanEye className="h-5 w-5 mt-0.5 opacity-70 shrink-0" />
              <div>
                <div className="text-sm font-semibold">Multimodal</div>
                <div className="text-xs opacity-70">Image + text fusion</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5 col-span-2 sm:col-span-1">
              <ShieldCheck className="h-5 w-5 mt-0.5 opacity-70 shrink-0" />
              <div>
                <div className="text-sm font-semibold">Explainable</div>
                <div className="text-xs opacity-70">Confidence + signals</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container py-12 sm:py-16">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-[0.18em] font-semibold text-accent mb-2">
            Verification Desk
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground text-balance">
            Submit a news item for analysis
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Upload the image circulating with the story and paste the accompanying claim. XFake fuses visual and
            cross-lingual textual signals to assess credibility.
          </p>
        </div>

        <DetectorForm />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container py-8 text-center">
          <p className="font-serif text-lg italic text-muted-foreground">
            "In an era of viral misinformation, verification is journalism."
          </p>
          <p className="text-xs text-muted-foreground mt-3 uppercase tracking-[0.18em]">
            XFake · A multimodal multilingual fake news detector
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
