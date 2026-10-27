import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Função para autenticar o utilizador/congregação
export async function loginUsuario(email: string, senha: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, senha);
  const user = userCredential.user;

  // Extrai a congregação a partir do e-mail (ex: "LSPIRACICABA-98145@gmail.com" -> "LSPIRACICABA-98145")
  const congregacaoId = user.email ? user.email.split("@")[0] : "";

  return {
    uid: user.uid,
    email: user.email,
    congregacaoId,
  };
}

// Função para terminar a sessão
export async function logoutUsuario() {
  return signOut(auth);
}