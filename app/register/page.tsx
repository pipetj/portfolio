"use client";  

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleRegister} className="space-y-4 p-6 border rounded-lg">
        <Input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Mot de passe" onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit">S'inscrire</Button>
      </form>
    </div>
  );
}
