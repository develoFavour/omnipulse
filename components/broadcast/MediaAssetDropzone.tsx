"use client";

import { useState, useRef } from "react";
import { 
  UploadCloud, 
  Image as ImageIcon, 
  X, 
  Link as LinkIcon, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  Maximize2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MediaAssetDropzoneProps {
  mediaUrl: string;
  onMediaChange: (url: string) => void;
}

export function MediaAssetDropzone({ mediaUrl, onMediaChange }: MediaAssetDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please upload an image file (JPG, PNG, WebP, GIF).",
      });
      return;
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File exceeds 10MB", {
        description: "Please compress your media asset before uploading.",
      });
      return;
    }

    setIsUploading(true);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (cloudName && uploadPreset) {
        // Direct Cloudinary unsigned upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Cloudinary upload failed");
        }

        const data = await response.json();
        onMediaChange(data.secure_url);
        toast.success("Image uploaded to Cloudinary CDN!");
      } else {
        // High-performance client object URL with notification for deployment
        const localUrl = URL.createObjectURL(file);
        onMediaChange(localUrl);
        toast.success("Image attached to broadcast!", {
          description: "For public production delivery, configure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.",
        });
      }
    } catch (err: any) {
      // Fallback to local object URL
      const localUrl = URL.createObjectURL(file);
      onMediaChange(localUrl);
      toast.info("Image attached locally", {
        description: "Cloudinary upload service returned an error. Using local media asset preview.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) return;
    try {
      new URL(customUrl.trim());
      onMediaChange(customUrl.trim());
      setShowUrlInput(false);
      setCustomUrl("");
      toast.success("Media URL attached!");
    } catch {
      toast.error("Invalid URL format", {
        description: "Please enter a valid HTTP/HTTPS image URL.",
      });
    }
  };

  const handleRemoveMedia = () => {
    onMediaChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
          <ImageIcon className="h-3.5 w-3.5 text-indigo-600" />
          Creative Media Attachment
          <span className="text-[10px] font-semibold text-gray-400 font-mono">Optional</span>
        </label>

        {!mediaUrl && (
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1.5"
          >
            <LinkIcon className="h-3 w-3" />
            {showUrlInput ? "Upload File instead" : "Paste Image URL"}
          </button>
        )}
      </div>

      {showUrlInput && !mediaUrl ? (
        <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://res.cloudinary.com/your-cloud/image/upload/..."
            className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 font-mono outline-none focus:border-indigo-600"
            onKeyDown={(e) => e.key === "Enter" && handleApplyCustomUrl()}
          />
          <button
            type="button"
            onClick={handleApplyCustomUrl}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shrink-0"
          >
            Attach
          </button>
        </div>
      ) : null}

      {mediaUrl ? (
        <div className="relative group overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-2 flex items-center gap-4 transition-all hover:border-gray-300">
          <div className="relative h-20 w-24 rounded-xl overflow-hidden bg-gray-900 shrink-0 border border-gray-200 shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mediaUrl}
              alt="Broadcast Asset"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                Asset Ready
              </span>
              <span className="text-[11px] font-mono text-gray-400 truncate max-w-[180px]">
                {mediaUrl.startsWith("data:") ? "Base64 Asset" : mediaUrl.split("/").pop()}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Will be delivered as native image header on Telegram & WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0 pr-2">
            <button
              type="button"
              onClick={() => window.open(mediaUrl, "_blank")}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white transition-colors"
              title="View full image"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleRemoveMedia}
              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Remove media"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200",
            isDragging
              ? "border-indigo-600 bg-indigo-50/60 scale-[0.99]"
              : "border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-white border border-gray-200/80 shadow-xs flex items-center justify-center text-indigo-600">
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <UploadCloud className="h-5 w-5" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-gray-900">
                {isUploading ? "Uploading media asset..." : "Drop creative image here, or browse files"}
              </p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                Supports PNG, JPG, WebP up to 10MB • Cloudinary CDN integration
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
