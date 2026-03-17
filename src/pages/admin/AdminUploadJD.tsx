import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, FileText } from "lucide-react";

export default function AdminUploadJD() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const { toast } = useToast();

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    let uploaded = 0;
    for (const file of files) {
      const { error } = await supabase.storage
        .from("JDs")
        .upload(`pending/${file.name}`, file, { upsert: true });
      if (error) {
        toast({ title: `Upload failed: ${file.name}`, description: error.message, variant: "destructive" });
      } else {
        uploaded++;
      }
    }

    setUploading(false);
    toast({ title: `${uploaded}/${files.length} files uploaded` });
    setFiles([]);
  };

  const runParser = async () => {
    setParsing(true);
    const { data, error } = await supabase.functions.invoke("parse-jd", {
      body: { mode: "batch" },
    });
    setParsing(false);
    if (error) {
      toast({ title: "Parse failed", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Parsing complete",
        description: `${data?.newly_processed || 0} new JDs parsed into staging`,
      });
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Upload Job Descriptions</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Step 1: Upload DOCX Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => document.getElementById("jd-input")?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to select DOCX files
            </p>
            {files.length > 0 && (
              <div className="mt-3 space-y-1">
                {files.map((f) => (
                  <div key={f.name} className="flex items-center gap-2 text-sm justify-center">
                    <FileText className="h-4 w-4" />
                    {f.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <input
            id="jd-input"
            type="file"
            accept=".docx"
            multiple
            className="hidden"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
          <Button onClick={handleUpload} disabled={uploading || files.length === 0} className="w-full">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
            Upload {files.length} file(s)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step 2: Parse Uploaded JDs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will parse all unprocessed DOCX files from the JDs/pending/ bucket into staging_jobs.
          </p>
          <Button onClick={runParser} disabled={parsing} className="w-full">
            {parsing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Run Parser
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
