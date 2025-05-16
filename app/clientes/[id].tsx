"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EditarCliente() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadCliente() {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Erro ao carregar cliente: " + error.message);
        router.push("/clientes");
      } else {
        setNome(data.nome);
        setEmail(data.email);
        setTelefone(data.telefone);
        setLoading(false);
      }
    }
    loadCliente();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("clientes")
      .update({ nome, email, telefone })
      .eq("id", id);

    if (error) {
      alert("Erro ao salvar cliente: " + error.message);
    } else {
      router.push("/clientes");
    }

    setSaving(false);
  }

  if (loading) return <p>Carregando cliente...</p>;

  return (
    <div>
      <h1>Editar Cliente</h1>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          placeholder="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          required
        />
        <button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
