import { downloadMediaMessage } from "baileys";

export async function setpp(client, message) {
    const remoteJid = message.key.remoteJid;

    try {
        const quoted =
            message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        const mediaMsg = quoted
            ? { message: quoted }
            : message;

        if (!quoted && !message.message?.imageMessage) {
            return await client.sendMessage(remoteJid, {
                text: "📸 Reply to an image."
            });
        }

        const buffer = await downloadMediaMessage(
            mediaMsg,
            "buffer",
            {}
        );

        if (!buffer) {
            return await client.sendMessage(remoteJid, {
                text: "❌ Download failed."
            });
        }

        await client.updateProfilePicture(remoteJid, {
            image: buffer
        });

        await client.sendMessage(remoteJid, {
            text: "✅ Profile picture updated 🚀"
        });

    } catch (err) {
        console.error("SETPP ERROR:", err.message);
        await client.sendMessage(remoteJid, {
            text: "❌ Error updating profile picture."
        });
    }
}

/* ========================= */

export async function getpp(client, message) {
    const remoteJid = message.key.remoteJid;

    try {
        const args =
            message.message?.conversation?.split(" ") ||
            [];

        let targetJid;

        if (args[1]?.includes("@")) {
            targetJid = args[1];
        } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            targetJid = message.message.extendedTextMessage.contextInfo.participant;
        } else {
            targetJid = remoteJid.includes("@g.us")
                ? remoteJid
                : client.user.id.split(":")[0] + "@s.whatsapp.net";
        }

        try {
            const url = await client.profilePictureUrl(targetJid, "image");

            await client.sendMessage(remoteJid, {
                image: { url },
                caption: "📸 Profile picture"
            });

        } catch {
            await client.sendMessage(remoteJid, {
                text: "❌ No profile picture found."
            });
        }

    } catch (err) {
        console.error("GETPP ERROR:", err.message);
        await client.sendMessage(remoteJid, {
            text: "❌ Error."
        });
    }
}

export default { setpp, getpp };