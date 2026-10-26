import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function listarFotos() {
  const snapshot = await getDocs(collection(db, "fotos"));

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .sort((a: any, b: any) => a.nome.localeCompare(b.nome));
}

export async function excluirFoto(id: string) {
  return deleteDoc(doc(db, "fotos", id));
}

export async function salvarFoto(url: string, nome: string) {
  return addDoc(collection(db, "fotos"), { url, nome });
}