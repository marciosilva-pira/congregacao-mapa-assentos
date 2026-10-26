import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function carregarMapa() {
  const snap = await getDoc(doc(db, "config", "mapa"));
  return snap.exists() ? snap.data() : {};
}

export async function salvarMapa(mapa: any) {
  return setDoc(doc(db, "config", "mapa"), mapa);
}