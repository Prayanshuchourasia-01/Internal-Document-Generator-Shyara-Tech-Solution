export const extractPlaceholders = (content) => {

    const regex = /\{([^{}]+)\}/g;

    const placeholders = [];

    let match;

    while ((match = regex.exec(content)) !== null) {
        placeholders.push(match[1].trim());
    }

    return [...new Set(placeholders)];
};