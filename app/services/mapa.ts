import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Carrega o mapa/configuração de uma congregação específica
export async function carregarMapa(congregacaoId: string) {
  if (!congregacaoId) return {};
  const snap = await getDoc(doc(db, "mapas", congregacaoId));
  return snap.exists() ? snap.data() : {};
}

// Salva o mapa/configuração vinculado ao ID da congregação
export async function salvarMapa(congregacaoId: string, mapa: any) {
  if (!congregacaoId) return;
  return setDoc(doc(db, "mapas", congregacaoId), mapa, { merge: true });
}