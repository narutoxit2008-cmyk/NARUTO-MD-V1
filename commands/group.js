const antilinkSettings = {};
const warnStorage = {};

/* =========================
   HELPERS
========================= */
function getText(message) {
    return (
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        ""
    );
}

function getTarget(message, args) {
    if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        return message.message.extendedTextMessage.contextInfo.participant;
    }
    if (args[0]) {
        return args[0].replace("@", "") + "@s.whatsapp.net";
    }
    return null;
}

function isGroup(jid) {
    return jid?.includes("@g.us");
}

/* =========================
   ANTILINK COMMAND
========================= */
export async function antilink(client, message) {
    const groupId = message.key.remoteJid;
    if (!isGroup(groupId)) return;

    try {
        const metadata = await client.groupMetadata(groupId);

        const senderId = message.key.participant || groupId;
        const sender = metadata.participants.find(p => p.id === senderId);

        if (!sender || sender.admin === null) {
            return await client.sendMessage(groupId, {
                text: "🔒 Admins uniquement !"
            });
        }

        const text = getText(message);
        const args = text.split(/\s+/).slice(1);
        const action = args[0]?.toLowerCase();

        if (!action) {
            return await client.sendMessage(groupId, {
                text:
`🔒 ANTILINK

.on
.off
.set delete | kick | warn
.status`
            });
        }

        switch (action) {
            case "on":
                antilinkSettings[groupId] = {
                    enabled: true,
                    action: "delete"
                };
                return await client.sendMessage(groupId, {
                    text: "✅ Antilink ON"
                });

            case "off":
                delete antilinkSettings[groupId];
                return await client.sendMessage(groupId, {
                    text: "❌ Antilink OFF"
                });

            case "set": {
                const setAction = args[1]?.toLowerCase();
                if (!["delete", "kick", "warn"].includes(setAction)) {
                    return await client.sendMessage(groupId, {
                        text: "❌ delete | kick | warn"
                    });
                }

                if (!antilinkSettings[groupId]) {
                    antilinkSettings[groupId] = {
                        enabled: true,
                        action: setAction
                    };
                } else {
                    antilinkSettings[groupId].action = setAction;
                }

                return await client.sendMessage(groupId, {
                    text: `✅ Action: ${setAction}`
                });
            }

            case "status":
                return await client.sendMessage(groupId, {
                    text:
`📊 ANTILINK STATUS
Enabled: ${antilinkSettings[groupId]?.enabled ? "Yes" : "No"}
Action: ${antilinkSettings[groupId]?.action || "None"}`
                });

            default:
                return;
        }

    } catch (err) {
        console.error(err);
    }
}

/* =========================
   LINK DETECTION
========================= */
export async function linkDetection(client, message) {
    const groupId = message.key.remoteJid;
    if (!isGroup(groupId)) return;

    const setting = antilinkSettings[groupId];
    if (!setting?.enabled) return;

    try {
        const metadata = await client.groupMetadata(groupId);

        const senderId = message.key.participant || groupId;
        const sender = metadata.participants.find(p => p.id === senderId);

        const botJid = client.user.id.split(":")[0] + "@s.whatsapp.net";
        const bot = metadata.participants.find(p => p.id === botJid);

        const text = getText(message);

        if (sender?.admin) return;
        if (!bot?.admin) return;

        const hasLink =
            /https?:\/\//i.test(text) ||
            /www\./i.test(text) ||
            /chat\.whatsapp\.com/i.test(text) ||
            /t\.me|discord|instagram|tiktok|facebook|youtube/i.test(text);

        if (!hasLink) return;

        // delete message
        try {
            await client.sendMessage(groupId, {
                delete: message.key
            });
        } catch {}

        const key = `${groupId}_${senderId}`;

        if (setting.action === "warn") {
            warnStorage[key] = (warnStorage[key] || 0) + 1;

            const warns = warnStorage[key];

            await client.sendMessage(groupId, {
                text: `🚫 LINK WARN ${warns}/3 @${senderId.split("@")[0]}`,
                mentions: [senderId]
            });

            if (warns >= 3) {
                await client.groupParticipantsUpdate(groupId, [senderId], "remove");
                delete warnStorage[key];
            }

        } else if (setting.action === "kick") {
            await client.groupParticipantsUpdate(groupId, [senderId], "remove");

        } else {
            await client.sendMessage(groupId, {
                text: `🚫 Link supprimé @${senderId.split("@")[0]}`,
                mentions: [senderId]
            });
        }

    } catch (err) {
        console.error(err);
    }
}

/* =========================
   KICK
========================= */
export async function kick(client, message) {
    const groupId = message.key.remoteJid;
    if (!isGroup(groupId)) return;

    try {
        const text = getText(message);
        const args = text.split(/\s+/).slice(1);
        const target = getTarget(message, args);

        if (!target) {
            return await client.sendMessage(groupId, {
                text: "❌ Mention or reply"
            });
        }

        await client.groupParticipantsUpdate(groupId, [target], "remove");

    } catch (err) {
        console.error(err);
    }
}

/* =========================
   KICKALL SAFE
========================= */
export async function kickall(client, message) {
    const groupId = message.key.remoteJid;
    if (!isGroup(groupId)) return;

    try {
        const metadata = await client.groupMetadata(groupId);

        const targets = metadata.participants
            .filter(p => !p.admin)
            .map(p => p.id);

        await client.sendMessage(groupId, {
            text: "⚡ KickAll..."
        });

        for (const id of targets) {
            try {
                await client.groupParticipantsUpdate(groupId, [id], "remove");
                await new Promise(r => setTimeout(r, 800));
            } catch {}
        }

    } catch (err) {
        console.error(err);
    }
}

/* =========================
   PROMOTE / DEMOTE
========================= */
export async function promote(client, message) {
    const groupId = message.key.remoteJid;
    if (!isGroup(groupId)) return;

    try {
        const text = getText(message);
        const args = text.split(/\s+/).slice(1);
        const target = getTarget(message, args);

        if (!target) return;

        await client.groupParticipantsUpdate(groupId, [target], "promote");

    } catch (err) {
        console.error(err);
    }
}

export async function demote(client, message) {
    const groupId = message.key.remoteJid;
    if (!isGroup(groupId)) return;

    try {
        const text = getText(message);
        const args = text.split(/\s+/).slice(1);
        const target = getTarget(message, args);

        if (!target) return;

        await client.groupParticipantsUpdate(groupId, [target], "demote");

    } catch (err) {
        console.error(err);
    }
}

/* =========================
   EXPORT
========================= */
export default {
    antilink,
    linkDetection,
    kick,
    kickall,
    promote,
    demote
};