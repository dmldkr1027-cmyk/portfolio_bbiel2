"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { User, BookOpen, ImageIcon, PenTool, Menu, ChevronDown } from "lucide-react";

const navigation = [
  { 
    title: "Webtoon", 
    href: "/webtoon", 
    icon: BookOpen,
    children: [
      { title: "배드 럭 큐피드", href: "/webtoon/work-1" },
      { title: "내가 잘못했어!", href: "/webtoon/work-2" },
      { title: "쓰레기는 이제 그만!", href: "/webtoon/work-3" },
    ]
  },
  { 
    title: "Illustration", 
    href: "/illustration/ld", 
    icon: ImageIcon,
    children: [
      { title: "LD", href: "/illustration/ld" },
      { title: "SD", href: "/illustration/sd" },
      { title: "Character Sheet", href: "/illustration/sheet" },
    ]
  },
  { title: "Etc.", href: "/casual", icon: PenTool },
  { title: "Contact", href: "/profile", icon: User },
];

export function PortfolioHeader() {
  const pathname = usePathname();
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-all duration-300 overflow-hidden",
        hoveredNav ? "h-[104px]" : "h-16"
      )}
      onMouseLeave={() => setHoveredNav(null)}
    >
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        
        {/* Mobile Nav */}
        <Sheet>
          <div className="md:hidden flex items-center shrink-0">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 -ml-2">
                <Menu className="w-6 h-6 text-slate-700" />
                <span className="sr-only">Toggle navigation</span>
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent side="left" className="w-[240px] p-6 bg-[#FAFDFF]">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SheetDescription className="sr-only">Main menu</SheetDescription>
            <div className="flex flex-col gap-6">
              <a href="/" className="font-bold text-xl text-[#006699]">
                Portfolio
              </a>
              <nav className="flex flex-col gap-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (pathname.startsWith("/" + item.title.toLowerCase()) && item.href !== "/");
                  return (
                    <div key={item.title} className="flex flex-col">
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                          isActive ? "bg-[#e5f3fa] text-[#006699]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.title}
                      </Link>
                      {item.children && (
                        <div className="flex flex-col ml-8 mt-1 gap-1">
                          {item.children.map(child => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "block px-3 py-1.5 text-xs rounded-md transition-colors",
                                pathname === child.href ? "text-[#006699] font-bold" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                              )}
                            >
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Title / Logo */}
        <a href="/" className="hidden md:flex items-center gap-2 mr-12">
          <span className="font-bold text-2xl text-[#006699]">Portfolio</span>
        </a>
        <div className="md:hidden flex-1 text-center font-bold text-lg text-[#006699]">
          <a href="/">Portfolio</a>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex flex-1 items-center gap-8 relative h-full">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith("/" + item.title.toLowerCase()) && item.href !== "/");
            
            if (item.children) {
              return (
                <div 
                  key={item.title} 
                  className="relative h-full flex flex-col items-center justify-center"
                  onMouseEnter={() => setHoveredNav(item.title)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 text-[15px] font-semibold transition-colors",
                      isActive ? "text-[#006699]" : "text-slate-600 hover:text-[#006699]"
                    )}
                  >
                    {item.title}
                    <ChevronDown className={cn("w-4 h-4 opacity-50 transition-transform", hoveredNav === item.title ? "rotate-180" : "")} />
                  </Link>
                  
                  {/* Mega Menu Under this item specifically */}
                  <div 
                    className={cn(
                      "absolute top-[64px] left-1/2 -translate-x-1/2 w-max flex flex-row items-center justify-center gap-3 text-[14px] transition-all duration-300",
                      hoveredNav === item.title ? "opacity-100 visible h-auto pb-4 pt-2" : "opacity-0 invisible h-0"
                    )}
                  >
                    {item.children.map((child, idx) => (
                      <div key={child.href} className="flex items-center gap-3">
                        <Link
                          href={child.href}
                          className={cn(
                            "text-slate-500 hover:text-[#006699] transition-colors font-medium whitespace-nowrap",
                            pathname === child.href ? "text-[#006699] font-bold" : ""
                          )}
                        >
                          {child.title}
                        </Link>
                        {idx < item.children.length - 1 && (
                          <span className="text-slate-300 font-light">|</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={item.title} 
                className="h-full flex items-center"
                onMouseEnter={() => setHoveredNav(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-[15px] font-semibold transition-colors",
                    isActive ? "text-[#006699]" : "text-slate-600 hover:text-[#006699]"
                  )}
                >
                  {item.title}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Social Links */}
        <div className="flex items-center gap-4 ml-auto pl-4">
          <Link 
            href="https://postype.com/@bbi1bl" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-slate-400 hover:text-[#006699] transition-colors"
            title="포스타입"
          >
            <span className="sr-only">Postype</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h6a5 5 0 0 1 0 10h-6" />
              <path d="M4 4v16" />
            </svg>
          </Link>
          <Link 
            href="http://x.com/BBI1BL" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-slate-400 hover:text-[#1DA1F2] transition-colors"
            title="트위터"
          >
            <span className="sr-only">Twitter</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
