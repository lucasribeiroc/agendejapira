"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClientes() {
      setLoading(true);
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        alert("Erro ao buscar clientes: " + error.message);
      } else {
        setClientes(data || []);
      }
      setLoading(false);
    }

    fetchClientes();
  }, []);

  if (loading) return <p>Carregando clientes...</p>;

  return (
    <div>
      <h1>Meus Clientes</h1>
      {clientes.length === 0 && <p>Nenhum cliente cadastrado.</p>}
      <ul>
        {clientes.map((cliente) => (
          <li key={cliente.id}>
            {cliente.nome} - {cliente.email} - {cliente.telefone}
          </li>
        ))}
      </ul>
    </div>
  );
}
