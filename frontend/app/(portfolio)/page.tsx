import { prisma } from "@/lib/prisma";
import Image from "next/image";
import AdminHomeBgUpload from "@/components/admin-home-bg-upload";

export const dynamic = 'force-dynamic'; // Ensures fresh data

export default async function HomePage() {
  const profile = await prisma.profile.findFirst().catch(() => null);
  const homeBgUrl = profile?.homeBgUrl;

  const getImageSrc = (url: string | null) => {
    if (!url) return null;
    if (url.includes("blob.vercel-storage.com")) {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.slice(1);
        return `/api/file?pathname=${encodeURIComponent(pathname)}`;
      } catch (e) {
        return url;
      }
    }
    return url;
  };

  const displayBgUrl = getImageSrc(homeBgUrl);

  return (
    <div className="absolute inset-x-0 top-16 bottom-0 w-full min-h-[calc(100vh-64px)] bg-white text-zinc-900 overflow-hidden flex flex-col justify-between mx-auto -z-0">
      
      {/* Background Image & Gradient */}
      <div className="absolute inset-x-0 top-0 bottom-0 w-full h-full -z-10">
        {displayBgUrl ? (
          <>
            <Image 
              src={displayBgUrl} 
              alt="Background" 
              fill 
              className="object-cover object-center"
              priority
            />
            {/* White gradient overlay from bottom to transparent upwards */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white via-white/80 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-white" />
        )}
      </div>

      {/* Decorative Arcs - Only visible if no bg image, or we can keep them? User asked to change bg image. I'll hide arcs if bg image exists. */}
      {!homeBgUrl && (
        <>
          <div className="absolute top-[-5%] right-[-5%] w-[40vh] h-[40vh] border-[1px] border-zinc-200 rounded-full z-0" />
          <div className="absolute top-[30%] right-[-10%] w-[50vh] h-[50vh] border-[1px] border-zinc-200 rounded-full z-0" />
          <div className="absolute bottom-[-10%] right-[10%] w-[60vh] h-[60vh] border-[1px] border-zinc-200 rounded-full z-0" />
        </>
      )}

      {/* Admin Upload Trigger */}
      <AdminHomeBgUpload currentUrl={homeBgUrl || null} />

      {/* Top Section */}
      <div className="relative z-10 flex justify-between items-start w-full max-w-7xl mx-auto p-8 md:p-16 lg:p-24 pt-8">
        <div className="flex flex-col gap-1">
          <p className="text-sm md:text-base font-medium text-zinc-600 tracking-tight">
            부드러운 작화로
          </p>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            섬세한 감정을 담아냅니다
          </h2>
        </div>
        <div className="text-xl md:text-2xl font-bold tracking-tight">
          2026
        </div>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 flex flex-col gap-4 md:gap-8 w-full max-w-7xl mx-auto mt-auto p-8 md:p-16 lg:p-24 pb-8">
        <h1 className="text-6xl sm:text-7xl md:text-9xl lg:text-[160px] font-black tracking-[-0.04em] leading-none text-zinc-900 drop-shadow-md">
          PORTFOLIO.
        </h1>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-8 text-sm md:text-base font-semibold text-zinc-500 max-w-full overflow-hidden mb-6 drop-shadow-sm">
          <span className="text-zinc-800">삐엘</span>
          <span className="hidden md:inline text-zinc-300">/</span>
          <span>bbi1bl@naver.com</span>
          <span className="hidden md:inline text-zinc-300">/</span>
          <span>@BBI1BL</span>
        </div>
      </div>
    </div>
  );
}
