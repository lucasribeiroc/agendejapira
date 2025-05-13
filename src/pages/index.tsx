// src/pages/index.tsx

"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Home() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.from("clientes").select("*");
      if (error) console.error("Erro ao buscar dados:", error);
      else setData(data);
    }

    fetchData();
  }, []);

  return (
    <main>
      <h1>Teste de conexão com Supabase</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
