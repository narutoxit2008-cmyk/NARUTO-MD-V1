import axios from "axios";

async function img(message, client) {
    const remoteJid = message.key.remoteJid;

    const text =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        "";

    const args = text.trim().split(/\s+/).slice(1);
    const query = args.join(" ");

    if (!query) {
        return await client.sendMessage(remoteJid, {
            text: "🖼️ Fournis des mots-clés\nExemple: .img anime girl"
        });
    }

    try {
        await client.sendMessage(remoteJid, {
            text: `🔍 Recherche pour "${query}"...`
        });

        const { data } = await axios.get(
            `https://christus-api.vercel.app/image/Pinterest?query=${encodeURIComponent(query)}&limit=10`,
            { timeout: 15000 }
        );

        const results = data?.results || [];

        if (!results.length) {
            return await client.sendMessage(remoteJid, {
                text: "❌ Aucune image trouvée."
            });
        }

        const images = results
            .filter(i => i.imageUrl)
            .slice(0, 5);

        if (!images.length) {
            return await client.sendMessage(remoteJid, {
                text: "❌ Images invalides."
            });
        }

        for (const img of images) {
            try {
                await client.sendMessage(remoteJid, {
                    image: { url: img.imageUrl },
                    caption:
                        `📷 ${query}\n` +
                        `${img.title && img.title !== "No title" ? img.title + "\n" : ""}`
                });

                await new Promise(r => setTimeout(r, 800));

            } catch (e) {
                console.log("Skip image error");
            }
        }

    } catch (error) {
        console.error("IMG ERROR:", error.message);

        await client.sendMessage(remoteJid, {
            text: "❌ API error or timeout."
        });
    }
}

export default img;