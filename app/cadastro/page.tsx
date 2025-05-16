"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CadastroPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    // 1. Cadastra no auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (authError || !authData.user) {
      setErro(authError?.message || "Erro desconhecido no cadastro.");
      setCarregando(false);
      return;
    }

    const userId = authData.user.id;

    // 2. Insere na tabela usuarios
    const { error: insertError } = await supabase.from("usuarios").insert([
      {
        id: userId,
        email,
        nome,
        telefone,
      },
    ]);

    if (insertError) {
      setErro("Cadastro no banco falhou: " + insertError.message);
      setCarregando(false);
      return;
    }

    router.push("/dashboard");
    setCarregando(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Cadastro</h1>

      <form onSubmit={handleCadastro}>
        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          style={{ display: "block", marginBottom: 10 }}
        />

        <input
          type="tel"
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          required
          style={{ display: "block", marginBottom: 10 }}
        />

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: "block", marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          style={{ display: "block", marginBottom: 10 }}
        />

        <button type="submit" disabled={carregando}>
          {carregando ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      {erro && <p style={{ color: "red" }}>{erro}</p>}
    </div>
  );
}
