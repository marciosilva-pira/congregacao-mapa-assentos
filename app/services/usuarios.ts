import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function loginUsuario(email: string, senha: string) {
  const snapshot = await getDocs(collection(db, "usuarios"));

  const userDoc = snapshot.docs.find(
    (doc) => doc.data().email.toLowerCase() === email.toLowerCase()
  );

  if (!userDoc) throw new Error("Usuário inválido");

  const data = userDoc.data();

  if (data.senha !== senha) throw new Error("Senha inválida");

  return data;
}

export async function criarUsuario(data: any) {
  return addDoc(collection(db, "usuarios"), data);
}