import Link from "next/link";

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Link href="/clientes">
        <button>Meus Clientes</button>
      </Link>
      {/* Outros conteúdos do dashboard */}
    </div>
  );
}
