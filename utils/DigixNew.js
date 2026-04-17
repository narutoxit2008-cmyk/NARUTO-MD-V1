export const DigixNew = (message) => {
    if (!message) return null;

    const msg =
        message.viewOnceMessageV2?.message ||
        message.viewOnceMessage?.message ||
        message.ephemeralMessage?.message ||
        message.message ||
        message;

    return msg;
};

export default DigixNew;