import stylizedChar from "../utils/fancy.js";

export async function pingTest(client, message) {
    const remoteJid = message.key.remoteJid;

    const start = Date.now();

    try {
        const sent = await client.sendMessage(remoteJid, {
            text: "📡 Pinging..."
        }, { quoted: message });

        const latency = Date.now() - start;

        await client.sendMessage(remoteJid, {
            text: stylizedChar(
                `🚀 NARUTO-MD-V1 Network\n\n` +
                `⚡ Latency: ${latency} ms\n` +
                `📡 Status: Online\n\n` +
                `Golden Naruto`
            )
        }, { quoted: message });

    } catch (err) {
        console.error("PING ERROR:", err);

        await client.sendMessage(remoteJid, {
            text: "❌ Ping failed."
        }, {