import { downloadMediaMessage } from "baileys";
import stylizedChar from "../utils/fancy.js";

export async function viewonce(client, message) {
    const remoteJid = message.key.remoteJid;

    const quoted =
        message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted) {
        return await client.sendMessage(remoteJid, {
            text: stylizedChar({ text: "_Reply to a ViewOnce message._" })
        });
    }

    // detect viewOnce safely
    const msgType =
        quoted.imageMessage ||
        quoted.videoMessage ||
        quoted.audioMessage;

    const isViewOnce =
        msgType?.viewOnce ||
        quoted?.viewOnceMessage;

    if (!msgType || !isViewOnce) {
        return await client.sendMessage(remoteJid, {
            text: stylizedChar({ text: "_This is not a ViewOnce message._" })
        });
    }

    try {
        const buffer = await downloadMediaMessage(
            { message: quoted },
            "buffer",
            {}
        );

        if (!buffer) {
            return await client.sendMessage(remoteJid, {
                text: stylizedChar("_Failed to download media._")
            });
        }

        if (quoted.imageMessage) {
            return await client.sendMessage(remoteJid, {
                image: buffer
            });
        }

        if (quoted.videoMessage) {
            return await client.sendMessage(remoteJid, {
                video: buffer
            });
        }

        if (quoted.audioMessage) {
            return await client.sendMessage(remoteJid, {
                audio: buffer,
                mimetype: "audio/mp4",
                ptt: true
            });
        }

    } catch (error) {
        console.error("ViewOnce error:", error);
        await client.sendMessage(remoteJid, {
            text: stylizedChar("_Error processing ViewOnce message._")
        });
    }
}

export default viewonce;