import { useEffect, useState } from "react";
import { useDisease } from "@/hooks/use-disease";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, AlertCircle, CheckCircle2, Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { jsPDF } from "jspdf";

export default function DiseaseDetection() {
  const { detect } = useDisease();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSampleLoading, setIsSampleLoading] = useState(false);
  const [loadingSampleUrl, setLoadingSampleUrl] = useState<string | null>(null);
  const [detectedAt, setDetectedAt] = useState<string | null>(null);
  const [headerImage, setHeaderImage] = useState<{ dataUrl: string; width: number; height: number } | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const supportedPlants = ["Pepper", "Potato", "Tomato"];
  const sampleImages = [
    {
      label: "Tomato leaf",
      url: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  const reportTimestamp = detect.data ? detectedAt : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      detect.reset();
      setDetectedAt(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleDetect = () => {
    if (!file) {
      toast({ title: "Please upload an image first", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    
    detect.mutate(formData);
  };

  const handleSampleImage = async (url: string) => {
    try {
      setIsSampleLoading(true);
      setLoadingSampleUrl(url);
      detect.reset();
      setDetectedAt(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const response = await fetch(url);
      const blob = await response.blob();
      const sampleFile = new File([blob], "sample-plant.jpg", { type: blob.type });
      setFile(sampleFile);
      setPreviewUrl(URL.createObjectURL(sampleFile));
    } catch (error) {
      toast({ title: "Failed to load sample image", variant: "destructive" });
    } finally {
      setIsSampleLoading(false);
      setLoadingSampleUrl(null);
    }
  };

  const handleDownloadReport = () => {
    if (!detect.data) return;
    const report = [
      `Disease: ${detect.data.disease_name || "Not available"}`,
      `Confidence: ${Number(detect.data.confidence_percentage) || 0}%`,
      `Cause: ${detect.data.cause || "Not available"}`,
      `Treatment: ${detect.data.solution || "Not available"}`,
      `Medicine: ${detect.data.medicine || "Not available"}`,
      reportTimestamp ? `Detected: ${reportTimestamp}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "plant-disease-report.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    if (!detect.data) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 48;
    const lineHeight = 18;
    let cursorY = 72;

    if (headerImage) {
      const targetWidth = pageWidth - margin * 2;
      const ratio = headerImage.height / headerImage.width;
      const headerHeight = Math.min(110, targetWidth * ratio);
      doc.addImage(headerImage.dataUrl, "JPEG", margin, 36, targetWidth, headerHeight);
      cursorY = 36 + headerHeight + 20;
    } else {
      doc.setFontSize(20);
      doc.text("Smart Plant Care Report", margin, 64);
      cursorY = 92;
    }

    doc.setDrawColor(220);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 22;

    doc.setFontSize(12);
    doc.setTextColor(90);
    doc.text(`Generated: ${reportTimestamp ?? new Date().toLocaleString()}`, margin, cursorY);
    cursorY += 28;
    doc.setFontSize(13);
    doc.setTextColor(30);

    const rows: Array<[string, string]> = [
      ["Disease", detect.data.disease_name || "Not available"],
      ["Confidence", `${Number(detect.data.confidence_percentage) || 0}%`],
      ["Status", detect.data.disease_name?.toLowerCase().includes("healthy") ? "Healthy" : "Needs attention"],
      ["Medicine", detect.data.medicine || "Not available"],
    ];

    rows.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, margin, cursorY);
      doc.setFont("helvetica", "normal");
      doc.text(value, margin + 110, cursorY, { maxWidth: pageWidth - margin - 120 });
      cursorY += lineHeight + 6;
    });

    cursorY += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Cause", margin, cursorY);
    cursorY += lineHeight;
    doc.setFont("helvetica", "normal");
    const causeLines = doc.splitTextToSize(detect.data.cause || "Not available", pageWidth - margin * 2);
    doc.text(causeLines, margin, cursorY);
    cursorY += causeLines.length * lineHeight + 8;

    doc.setFont("helvetica", "bold");
    doc.text("Treatment", margin, cursorY);
    cursorY += lineHeight;
    doc.setFont("helvetica", "normal");
    const treatmentLines = doc.splitTextToSize(
      detect.data.solution || "Not available",
      pageWidth - margin * 2
    );
    doc.text(treatmentLines, margin, cursorY);
    cursorY += treatmentLines.length * lineHeight + 12;

    doc.setFont("helvetica", "bold");
    doc.text("Next on PlantCare", margin, cursorY);
    cursorY += lineHeight;
    doc.setFont("helvetica", "normal");
    const nextLines = doc.splitTextToSize(
      "You can purchase recommended medicine and hire a gardener directly from our platform.",
      pageWidth - margin * 2
    );
    doc.text(nextLines, margin, cursorY);

    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text("Smart Plant Care • Generated by Disease Detection", margin, pageHeight - 32);
    doc.text("Page 1", pageWidth - margin - 32, pageHeight - 32);

    doc.save("plant-disease-report.pdf");
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    const loadHeader = async () => {
      try {
        const response = await fetch("/smart-plant-care-header.png");
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            setHeaderImage(null);
            URL.revokeObjectURL(objectUrl);
            return;
          }
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          setHeaderImage({
            dataUrl: canvas.toDataURL("image/jpeg", 0.95),
            width: img.width,
            height: img.height,
          });
          URL.revokeObjectURL(objectUrl);
        };
        img.onerror = () => {
          setHeaderImage(null);
          URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;
      } catch {
        setHeaderImage(null);
      }
    };
    loadHeader();
  }, []);

  useEffect(() => {
    if (detect.data) {
      setDetectedAt(new Date().toLocaleString());
    }
  }, [detect.data]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border bg-secondary/10 px-3 py-1 text-xs text-muted-foreground">
          AI-assisted plant care
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold">
          AI Disease Detection
        </h1>
        <p className="text-muted-foreground">
          Upload a clear leaf photo to get a focused diagnosis and treatment guidance.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left: Upload Area */}
        <div className="space-y-6">
          <Card className="border-2 border-dashed border-border/60 shadow-none bg-secondary/5 hover:bg-secondary/10 transition-colors">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              {previewUrl ? (
                <div className="relative w-full aspect-square max-w-[400px] rounded-2xl overflow-hidden mb-6 group shadow-lg">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <Button
                      variant="secondary"
                      className="rounded-full"
                      onClick={() => {
                        detect.reset();
                        setDetectedAt(null);
                        setPreviewUrl(null);
                        setFile(null);
                      }}
                    >
                      Change Image
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-primary/10 p-5 rounded-full mb-6 ring-8 ring-primary/5">
                    <Upload className="h-9 w-9 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Upload Plant Photo</h3>
                  <p className="text-muted-foreground text-sm mb-8 max-w-xs leading-relaxed">Ensure the leaf is clearly visible and well-lit for the most accurate results.</p>
                  <div className="relative">
                    <Button size="lg" className="rounded-full px-8 shadow-md">Select Image</Button>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 justify-center">
                    {sampleImages.map((sample) => (
                      <Button
                        key={sample.label}
                        variant="outline"
                        className="rounded-full"
                        onClick={() => handleSampleImage(sample.url)}
                        disabled={isSampleLoading}
                      >
                        {loadingSampleUrl === sample.url ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                          </>
                        ) : (
                          `Try ${sample.label}`
                        )}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Button 
            size="lg" 
            className="w-full h-12 text-base rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all" 
            onClick={handleDetect}
            disabled={!file || detect.isPending}
          >
            {detect.isPending ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Deep Analysis in Progress...
              </>
            ) : (
              "Analyze Plant Health"
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Best results: single leaf, good lighting, plain background.
          </p>

          <div className="rounded-2xl border bg-background p-5">
            <h3 className="font-semibold mb-2 text-sm">Supported plants</h3>
            <div className="flex flex-wrap gap-2">
              {supportedPlants.map((plant) => (
                <span key={plant} className="rounded-full border bg-secondary/10 px-3 py-1 text-xs">
                  {plant}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Scope: Pepper, Potato, and Tomato diseases only.
            </p>
          </div>
          {user && (
            <Link href="/disease-history">
              <Button variant="outline" className="w-full rounded-xl">
                View My Disease History
              </Button>
            </Link>
          )}
        </div>

        {/* Right: Results Area */}
        <div className="space-y-6">
          {detect.data ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-700">
              <div className={`p-6 rounded-3xl border shadow-sm ${detect.data.disease_name?.toLowerCase().includes('healthy') ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {detect.data.disease_name?.toLowerCase().includes('healthy') ? (
                      <div className="bg-green-500 p-2 rounded-full"><CheckCircle2 className="h-6 w-6 text-white" /></div>
                    ) : (
                      <div className="bg-red-500 p-2 rounded-full"><AlertCircle className="h-6 w-6 text-white" /></div>
                    )}
                    <div>
                      <h2 className="text-3xl font-bold font-display">
                        {detect.data.disease_name || "Not available"}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${detect.data.disease_name?.toLowerCase().includes('healthy') ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{
                              width: `${Math.min(100, Math.max(0, Number(detect.data.confidence_percentage) || 0))}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground">
                          {Number(detect.data.confidence_percentage) || 0}% Confidence
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {Number(detect.data.confidence_percentage) < 50 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900">
                  Low confidence. Try a clearer photo for more accurate results.
                </div>
              )}

              <div className="rounded-2xl border bg-secondary/10 p-5">
                <h3 className="font-semibold mb-2 text-sm">Summary</h3>
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <div>
                    <span className="font-semibold text-foreground">Disease:</span>{" "}
                    {detect.data.disease_name || "Not available"}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Confidence:</span>{" "}
                    {Number(detect.data.confidence_percentage) || 0}%
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Detected:</span>{" "}
                    {reportTimestamp}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Status:</span>{" "}
                    {detect.data.disease_name?.toLowerCase().includes("healthy")
                      ? "Healthy"
                      : "Needs attention"}
                  </div>
                </div>
              </div>
              <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  <div className="relative pl-6 border-l-4 border-primary/20">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <span className="text-primary">•</span> Cause
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {detect.data.cause || "Not available"}
                    </p>
                  </div>
                  
                  <div className="relative pl-6 border-l-4 border-primary/20">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <span className="text-primary">•</span> Treatment Solution
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {detect.data.solution || "Not available"}
                    </p>
                  </div>

                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 group hover:bg-primary/10 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-primary p-2 rounded-lg group-hover:scale-110 transition-transform">
                        <Pill className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-bold text-primary text-lg">Recommended Medicine</h3>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">
                      {detect.data.medicine || "Not available"}
                    </p>
                    {detect.data.medicine && (
                      <Link href={`/medicines?q=${encodeURIComponent(detect.data.medicine)}`}>
                        <Button variant="outline" className="mt-4 rounded-full">
                          Find in Store
                        </Button>
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="rounded-full" onClick={handleDownloadPdf}>
                      Download report (PDF)
                    </Button>
                    <Button variant="outline" className="rounded-full" onClick={handleDownloadReport}>
                      Download report (TXT)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-3xl bg-secondary/5 text-muted-foreground border-border/40">
              <div className="relative mb-8">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/628/628283.png" 
                  alt="Analyze" 
                  className="w-32 h-32 opacity-10 grayscale" 
                />
                <div className="absolute -bottom-2 -right-2 bg-primary/20 p-3 rounded-full animate-pulse">
                  <AlertCircle className="h-6 w-6 text-primary/40" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground">Ready when you are</h3>
              <p className="max-w-xs mx-auto leading-relaxed">
                Upload a clear leaf photo to see the disease name, confidence score, and treatment advice.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
