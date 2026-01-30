"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">Ouvidoria Digital</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/manifestacao"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Nova Manifestacao
          </Link>
          <Link
            href="/meus-registros"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Meus Registros
          </Link>
        </nav>
      </div>
    </header>
  );
}