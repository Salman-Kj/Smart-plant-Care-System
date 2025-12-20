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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [simulationChoice, setSimulationChoice] = useState("Healthy");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // In a real app, we'd upload this. For demo, we just pass a string.
      setSelectedImage("simulated-upload.jpg");
    }
  };

  const handleDetect = () => {
    if (!selectedImage) {
      toast({ title: "Please upload an image first", variant: "destructive" });
      return;
    }
    detect.mutate({
      imageUrl: "https://images.unsplash.com/photo-1599598425947-d35b4877eb44?auto=format&fit=crop&q=80", // Using a stock image for the API call to work
      imageName: simulationChoice
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-display font-bold mb-4">AI Disease Detection</h1>
        <p className="text-muted-foreground">Upload a photo of your plant's leaves. Our AI model will analyze it for common diseases and recommend treatment.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left: Upload Area */}
        <div className="space-y-6">
          <Card className="border-2 border-dashed border-border/60 shadow-none bg-secondary/10">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              {previewUrl ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6 group">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" onClick={() => { setPreviewUrl(null); setSelectedImage(null); }}>Change Image</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-background p-4 rounded-full mb-4 shadow-sm">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Upload Plant Photo</h3>
                  <p className="text-muted-foreground text-sm mb-6 max-w-xs">Supported formats: JPG, PNG. Max size: 10MB.</p>
                  <div className="relative">
                    <Button>Select Image</Button>
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

          {/* Simulation Controls (For Demo Purposes) */}
          <div className="bg-muted p-4 rounded-lg">
            <Label className="mb-2 block text-xs font-bold uppercase text-muted-foreground">Simulation Control (Dev Only)</Label>
            <div className="flex gap-2 flex-wrap">
              {SIMULATED_DISEASES.map((disease) => (
                <Button 
                  key={disease.name} 
                  variant={simulationChoice === disease.name ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setSimulationChoice(disease.name)}
                >
                  {disease.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Select what result you want the AI to return for testing.</p>
          </div>

          <Button 
            size="lg" 
            className="w-full h-14 text-lg" 
            onClick={handleDetect}
            disabled={!selectedImage || detect.isPending}
          >
            {detect.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
              </>
            ) : (
              "Analyze Plant Health"
            )}
          </Button>
        </div>

        {/* Right: Results Area */}
        <div className="space-y-6">
          {detect.data ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className={`p-6 rounded-2xl border ${detect.data.name === 'Healthy' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  {detect.data.name === 'Healthy' ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  )}
                  <h2 className="text-2xl font-bold">{detect.data.name}</h2>
                </div>
                <p className="text-muted-foreground">Confidence: 98.5%</p>
              </div>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Cause</h3>
                    <p className="text-muted-foreground leading-relaxed">{detect.data.cause}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Solution</h3>
                    <p className="text-muted-foreground leading-relaxed">{detect.data.solution}</p>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-primary">Recommended Medicine</h3>
                    </div>
                    <p className="text-sm">{detect.data.medicine}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-2xl text-muted-foreground">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/628/628283.png" 
                alt="Analyze" 
                className="w-24 h-24 mb-6 opacity-20 grayscale" 
              />
              <h3 className="text-xl font-medium mb-2">Waiting for analysis</h3>
              <p>Upload an image and click analyze to see detailed health report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
