import { useState } from "react";
import { useDisease } from "@/hooks/use-disease";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, AlertCircle, CheckCircle2, Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Simulated diseases for demo - In real app, this comes from backend logic
const SIMULATED_DISEASES = [
  { name: "Healthy", label: "Healthy Plant" },
  { name: "Late Blight", label: "Tomato Late Blight" },
  { name: "Powdery Mildew", label: "Powdery Mildew" },
];

export default function DiseaseDetection() {
  const { detect, history } = useDisease();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-display font-bold mb-4">AI Disease Detection</h1>
        <p className="text-muted-foreground">Upload a photo of your plant's leaves. Our advanced AI model will perform a deep analysis to identify diseases and suggest effective treatments.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left: Upload Area */}
        <div className="space-y-6">
          <Card className="border-2 border-dashed border-border/60 shadow-none bg-secondary/5 hover:bg-secondary/10 transition-colors">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              {previewUrl ? (
                <div className="relative w-full aspect-square max-w-[400px] rounded-2xl overflow-hidden mb-6 group shadow-lg">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <Button variant="secondary" className="rounded-full" onClick={() => { setPreviewUrl(null); setFile(null); }}>Change Image</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-primary/10 p-6 rounded-full mb-6 ring-8 ring-primary/5">
                    <Upload className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Upload Plant Photo</h3>
                  <p className="text-muted-foreground text-sm mb-8 max-w-xs leading-relaxed">Ensure the leaf is clearly visible and well-lit for the most accurate results.</p>
                  <div className="relative">
                    <Button size="lg" className="rounded-full px-10 shadow-md">Select Image</Button>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleFileChange}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Button 
            size="lg" 
            className="w-full h-16 text-xl rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all" 
            onClick={handleDetect}
            disabled={!file || detect.isPending}
          >
            {detect.isPending ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" /> Deep Analysis in Progress...
              </>
            ) : (
              "Analyze Plant Health"
            )}
          </Button>
        </div>

        {/* Right: Results Area */}
        <div className="space-y-6">
          {detect.data ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-700">
              <div className={`p-8 rounded-3xl border shadow-sm ${detect.data.disease?.toLowerCase().includes('healthy') ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {detect.data.disease?.toLowerCase().includes('healthy') ? (
                      <div className="bg-green-500 p-2 rounded-full"><CheckCircle2 className="h-6 w-6 text-white" /></div>
                    ) : (
                      <div className="bg-red-500 p-2 rounded-full"><AlertCircle className="h-6 w-6 text-white" /></div>
                    )}
                    <div>
                      <h2 className="text-3xl font-bold font-display">{detect.data.disease}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${detect.data.disease?.toLowerCase().includes('healthy') ? 'bg-green-500' : 'bg-red-500'}`} 
                            style={{ width: `${detect.data.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground">{detect.data.confidence}% Confidence</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                <CardContent className="p-8 space-y-8">
                  <div className="relative pl-6 border-l-4 border-primary/20">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <span className="text-primary">•</span> Cause
                    </h3>
                    <p className="text-muted-foreground leading-relaxed italic">"{detect.data.cause}"</p>
                  </div>
                  
                  <div className="relative pl-6 border-l-4 border-primary/20">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <span className="text-primary">•</span> Treatment Solution
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{detect.data.solution}</p>
                  </div>

                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 group hover:bg-primary/10 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-primary p-2 rounded-lg group-hover:scale-110 transition-transform">
                        <Pill className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-bold text-primary text-lg">Recommended Medicine</h3>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{detect.data.medicine}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-3xl bg-secondary/5 text-muted-foreground border-border/40">
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
              <h3 className="text-2xl font-bold mb-3 text-foreground">Waiting for analysis</h3>
              <p className="max-w-xs mx-auto leading-relaxed">Upload a clear photo of the affected plant leaf and click analyze to receive a detailed health report from our AI expert.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
