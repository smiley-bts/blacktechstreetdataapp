/**
 * PROJECT UPLOAD PAGE
 * MarkusV4 | 2026-02-24
 *
 * Route: /upload/:eventId?token=<qr_token>
 *
 * Participants land here from their confirmation email / QR code.
 * They can upload a project file + fill in details.
 * The file goes to Supabase Storage; metadata goes to project_submissions.
 */

import { useState, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Upload, CheckCircle, FileText, Loader2 } from "lucide-react";

const CATEGORIES = [
  { value: "health",      label: "Health & Wellness" },
  { value: "education",   label: "Education & Youth" },
  { value: "economic",    label: "Economic Empowerment" },
  { value: "tech",        label: "Technology & Innovation" },
  { value: "community",   label: "Community & Civic" },
  { value: "creative",    label: "Creative & Arts" },
  { value: "other",       label: "Other" },
];

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB
const ACCEPTED_TYPES = {
  "application/pdf":      [".pdf"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "application/msword":   [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "image/jpeg":           [".jpg", ".jpeg"],
  "image/png":            [".png"],
  "image/gif":            [".gif"],
  "video/mp4":            [".mp4"],
};

export default function ProjectUpload() {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const qrToken = searchParams.get("token");

  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory]     = useState("");
  const [teamName, setTeamName]     = useState("");
  const [demoUrl, setDemoUrl]       = useState("");
  const [file, setFile]             = useState<File | null>(null);
  const [loading, setLoading]       = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_BYTES,
    maxFiles: 1,
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0];
      toast({
        title: "File rejected",
        description: err?.code === "file-too-large"
          ? "File must be under 25 MB"
          : "File type not supported",
        variant: "destructive",
      });
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Project title is required", variant: "destructive" });
      return;
    }
    if (!eventId) {
      toast({ title: "Invalid upload link — missing event ID", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // ── Resolve registration by QR token ─────────────────
      let registrationId: string | null = null;
      let email: string | null = null;
      let fullName: string | null = null;

      if (qrToken) {
        const { data: reg } = await supabase
          .from("event_registrations")
          .select("id, email, full_name")
          .eq("qr_token", qrToken)
          .eq("event_id", eventId)
          .single();

        if (reg) {
          registrationId = reg.id;
          email = reg.email;
          fullName = reg.full_name;
        }
      }

      // ── Upload file to Supabase Storage ───────────────────
      let fileUrl: string | null = null;
      let storagePath: string | null = null;
      let fileName: string | null = null;
      let fileType: string | null = null;
      let fileSizeBytes: number | null = null;

      if (file) {
        const ext  = file.name.split(".").pop();
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
        storagePath = `projects/${eventId}/${Date.now()}-${slug}.${ext}`;
        fileName    = file.name;
        fileType    = file.type;
        fileSizeBytes = file.size;

        const { error: uploadError } = await supabase.storage
          .from("project-files")
          .upload(storagePath, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("project-files")
          .getPublicUrl(storagePath);

        fileUrl = urlData?.publicUrl || null;
      }

      // ── Insert project_submission ─────────────────────────
      const { error: insertError } = await supabase
        .from("project_submissions")
        .insert({
          event_id:            eventId,
          registration_id:     registrationId,
          email,
          full_name:           fullName,
          team_name:           teamName.trim() || null,
          project_title:       title.trim(),
          project_description: description.trim() || null,
          project_category:    category || null,
          file_url:            fileUrl,
          file_name:           fileName,
          file_type:           fileType,
          file_size_bytes:     fileSizeBytes,
          storage_path:        storagePath,
          demo_url:            demoUrl.trim() || null,
        });

      if (insertError) throw insertError;

      setSubmitted(true);

    } catch (err: any) {
      console.error("Upload error:", err);
      toast({
        title: "Upload failed",
        description: err?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // ── Success State ─────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Project Submitted! 🚀</h1>
          <p className="text-gray-400">
            Your project has been uploaded. The BTS team will review it and it may
            be featured in the program showcase.
          </p>
          <p className="text-sm text-gray-600">You can close this tab.</p>
        </div>
      </div>
    );
  }

  // ── Upload Form ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-xl mx-auto px-6 py-12 space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <img
            src="/images/bts-logo-white.png"
            alt="Black Tech Street"
            className="h-10 mx-auto"
          />
          <h1 className="text-2xl font-bold">Submit Your Project</h1>
          <p className="text-gray-400 text-sm">
            Share what you built at the ASPIRE program. Files accepted: PDF, PowerPoint, Word, images, video.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Project title */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">
              Project Title <span className="text-red-400">*</span>
            </label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. TulsaCares Community Resource App"
              className="bg-gray-900 border-gray-700 text-white"
              required
            />
          </div>

          {/* Team name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">
              Team or Presenter Name
            </label>
            <Input
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="Your name or team name"
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="What area does your project address?" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 text-white">
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">
              Project Description
            </label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What does your project do? What problem does it solve? Who does it help?"
              className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
            />
          </div>

          {/* Demo URL */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">
              Demo Link <span className="text-gray-500">(optional)</span>
            </label>
            <Input
              value={demoUrl}
              onChange={e => setDemoUrl(e.target.value)}
              placeholder="https://..."
              type="url"
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>

          {/* File upload */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">
              Upload File <span className="text-gray-500">(PDF, PPT, DOCX, image, video — max 25 MB)</span>
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-green-400 bg-green-400/10"
                  : "border-gray-600 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex items-center justify-center gap-3 text-green-400">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-gray-500" />
                  <p className="text-sm text-gray-400">
                    {isDragActive ? "Drop it here" : "Drag & drop or click to select file"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold h-12"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...</>
            ) : (
              "Submit Project"
            )}
          </Button>

        </form>
      </div>
    </div>
  );
}
