import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import { CryptoPageClient } from "@/components/crypto-page-client";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Crypto Price Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
              Documentation
            </Link>
            <ModeToggle />
          </div>
        </div>
        
        <CryptoPageClient />
      </div>
    </main>
  );
}