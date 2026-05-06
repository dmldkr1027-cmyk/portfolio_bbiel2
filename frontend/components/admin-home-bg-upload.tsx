"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyPlus, X, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AdminModal } from "@/components/admin-modal";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminHomeBgUpload({ currentUrl }: { currentUrl: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSave = async () => {
    setIsUploading(true);
    try {
      let finalUrl = currentUrl;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!uploadRes.ok) throw new Error("업로드 실패");
        const uploadData = await uploadRes.json();
        finalUrl = uploadData.url;
      }

      // Update profile
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeBgUrl: finalUrl }),
      });

      if (!res.ok) throw new Error("업데이트 실패");

      toast({
        title: "배경이 업데이트되었습니다.",
      });

      router.refresh();
      setIsOpen(false);
    } catch (err: any) {
      toast({
        title: "저장에 실패했습니다.",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearUpload = () => {
    setFile(null);
    setPreviewUrl(currentUrl);
  };

  const handleClearBg = async () => {
    setIsUploading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeBgUrl: null }),
      });

      if (!res.ok) throw new Error("업데이트 실패");

      toast({
        title: "배경이 삭제되었습니다.",
      });

      router.refresh();
      setIsOpen(false);
      setFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      toast({
        title: "삭제에 실패했습니다.",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-50">
      <AdminModal
        open={isOpen}
        onOpenChange={setIsOpen}
        trigger={
          <Button variant="outline" size="sm" className="bg-white/50 hover:bg-white backdrop-blur-sm shadow-sm" onClick={() => setIsOpen(true)}>
            배경 이미지 변경
          </Button>
        }
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">홈 배경 이미지 설정</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-lg p-6 bg-zinc-50 relative min-h-[200px]">
              {previewUrl ? (
                <>
                  <Image 
                    src={previewUrl} 
                    alt="Preview" 
                    fill 
                    className="object-contain" 
                  />
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 rounded-full z-10"
                    onClick={clearUpload}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <div className="text-center text-zinc-500 flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 opacity-50" />
                  <p className="text-sm">클릭하여 이미지를 업로드하세요</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                onChange={handleFileChange}
              />
            </div>
            <div className="flex justify-between items-center mt-4">
              <Button variant="destructive" onClick={handleClearBg} disabled={isUploading || !currentUrl}>
                배경 삭제
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleSave} disabled={isUploading || (!file && previewUrl === currentUrl)}>
                  {isUploading ? "저장 중..." : "저장"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}