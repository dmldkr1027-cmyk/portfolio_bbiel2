import { PortfolioHeader } from '@/components/portfolio-header';

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PortfolioHeader />
      <main className="flex-1">
        <div className="container mx-auto py-6 px-4 md:py-8 md:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
