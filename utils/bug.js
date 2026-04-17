async function bug(message, client, texts, num) {
    try {
        const remoteJid = message.key?.remoteJid;

        if (!remoteJid) return console.log("No remoteJid found");

        const imagePath = `database/${num}.jpg`;

        await client.sendMessage(remoteJid, {
            image: { url: imagePath },
            caption: `> ${texts}`,
            contextInfo: {
                externalAdReply: {
                    title: "Join Our WhatsApp Channel",
                    body: "Golden Naruto",
                    mediaType: 1,
                    thumbnailUrl: imagePath,
                    renderLargerThumbnail: true,
                    sourceUrl: "https://whatsapp.com"
                }
            }
        });

    } catch (e) {
        console.log("Bug.js error:", e);
    }
}

export default bug;