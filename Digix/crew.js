import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';
import readline from 'readline';
import configmanager from '../utils/configmanager.js';
import pino from 'pino';
import fs from 'fs';

const data = 'sessionData';

async function connectToWhatsapp(handleMessage) {

    const { version } = await fetchLatestBaileysVersion();

    const { state, saveCreds } = await useMultiFileAuthState(data);

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        syncFullHistory: true,
        markOnlineOnConnect: true,
        logger: pino({ level: 'silent' }),
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {

        const { connection, lastDisconnect } = update;

        if (connection === 'close') {

            const statusCode = lastDisconnect?.error?.output?.statusCode;

            const shouldReconnect =
                statusCode !== DisconnectReason.loggedOut;

            console.log('❌ Disconnected');

            if (shouldReconnect) {
                setTimeout(() => connectToWhatsapp(handleMessage), 5000);
            } else {
                console.log('🚫 Logged out permanently');
            }

        } else if (connection === 'open') {

            console.log('✅ WhatsApp connected');

            // welcome message
            try {
                const chatId = '50935279754@s.whatsapp.net';
                const imagePath = './database/DigixCo.jpg';

                const messageText = `
╔══════════════════╗
   NARUTO-MD-V1 CONNECTED 🚀
╚══════════════════╝
                `;

                await sock.sendMessage(chatId, {
                    image: fs.existsSync(imagePath)
                        ? { url: imagePath }
                        : undefined,
                    caption: messageText
                });

                console.log('📩 Welcome sent');

            } catch (err) {
                console.log('❌ Welcome error:', err);
            }

            sock.ev.on('messages.upsert', (msg) => handleMessage(sock, msg));
        }
    });

    setTimeout(async () => {

        if (!state.creds.registered) {

            console.log('⚠️ Not registered, pairing...');

            const number = "50935279754"; // string !!

            try {

                const code = await sock.requestPairingCode(number, 'NARUTO-V1');

                console.log('📲 Pairing Code:', code);

                // SAFE config init
                configmanager.config.users[number] = {
                    sudoList: [`${number}@s.whatsapp.net`],
                    prefix: ".",
                    publicMode: false,
                    autoreact: false,
                    emoji: "🎯"
                };

                configmanager.save();

            } catch (e) {
                console.log('❌ Pairing error:', e);
            }
        }

    }, 5000);

    return sock;
}

export default connectToWhatsapp;