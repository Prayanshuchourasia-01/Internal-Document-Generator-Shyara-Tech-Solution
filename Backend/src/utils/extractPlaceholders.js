export const extractPlaceholders = (text) => {

    const regex = /<([^<>]+)>/g;

    const placeholders = [];

    let match;

    while ((match = regex.exec(text)) !== null) {
        placeholders.push(match[1].trim());
    }

    return [...new Set(placeholders)];
};