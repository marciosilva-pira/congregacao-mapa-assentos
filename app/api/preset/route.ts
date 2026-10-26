export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import dgram from "dgram";

export async function POST(req: NextRequest) {
  console.log("📡 API /preset chamada (via UDP WAN)");
  console.log("🚨 CHEGOU NA API /preset");

  try {
    const { preset, ip } = await req.json();
    //const { preset } = await req.json();

    // ⚠️ ATENÇÃO: Coloque aqui o IP PÚBLICO do seu roteador (ex: 177.55.44.33) 
    // ou o seu domínio DDNS (ex: minhaigreja.duckdns.org)
    // O IP 192.168.15.88 NÃO vai funcionar quando o app estiver na nuvem!
    const CAMERA_PUBLIC_IP = ip;
    //const CAMERA_PUBLIC_IP = "189.78.65.235"; 
    //const CAMERA_PUBLIC_IP = "192.168.15.88";
    const VISCA_PORT = 52381;

    console.log("Preset recebido:", preset);

    console.log("IP recebido:", CAMERA_PUBLIC_IP);
    console.log("🚀 Enviando para IP:", CAMERA_PUBLIC_IP);

    const viscaPreset = preset;
    console.log("Preset tratado:", viscaPreset);

    const payload = Buffer.from([
      0x81, 0x01, 0x04, 0x3F, 0x02, viscaPreset, 0xFF,
    ]);

    const header = Buffer.from([
      0x01, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00, 0x01
    ]);

    const command = Buffer.concat([header, payload]);

    console.log("📦 Payload:", command);

    await new Promise<void>((resolve, reject) => {
      const client = dgram.createSocket("udp4");

      client.send(command, 0, command.length, VISCA_PORT, CAMERA_PUBLIC_IP, (err) => {
        if (err) {
          console.error("❌ Erro ao enviar UDP:", err);
          client.close();
          reject(err);
        } else {
          console.log(`✅ Comando UDP disparado para WAN: ${CAMERA_PUBLIC_IP}`);
          client.close();
          resolve();
        }
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}