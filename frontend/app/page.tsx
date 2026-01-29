// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <Link 
        href="/manifestacao"
        className="text-2xl font-semibold bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
      >
        Participa DF – Ouvidoria Digital Acessível
      </Link>
    </main>
  );
}