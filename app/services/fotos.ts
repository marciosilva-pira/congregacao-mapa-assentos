import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Interface para estruturar a foto
export interface FotoCongregacao {
  id?: string;
  congregacaoId: string;
  nome: string;
  base64: string; // A imagem convertida em texto Base64
  criadoEm?: Date;
}

// 1. Listar fotos apenas da congregação atual
export async function listarFotos(congregacaoId: string) {
  const fotosRef = collection(db, "fotos");
  const q = query(fotosRef, where("congregacaoId", "==", congregacaoId));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .sort((a: any, b: any) => a.nome.localeCompare(b.nome));
}

// 2. Excluir foto por ID
export async function excluirFoto(id: string) {
  return deleteDoc(doc(db, "fotos", id));
}

// 3. Salvar nova foto vinculada à congregação
export async function salvarFoto(congregacaoId: string, nome: string, base64: string) {
  return addDoc(collection(db, "fotos"), {
    congregacaoId,
    nome,
    base64,
    criadoEm: new Date(),
  });
}

// 4. Função auxiliar para converter o ficheiro de imagem em Base64
export function converterParaBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}