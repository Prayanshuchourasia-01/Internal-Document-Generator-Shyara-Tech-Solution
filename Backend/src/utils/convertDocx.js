import fs from 'fs';
import path from 'path';
import libre from 'libreoffice-convert';

export const convertDocxBufferToPdf = async (docxBuffer) => {
  return new Promise((resolve, reject) => {
    const extend = '.pdf';
    libre.convert(docxBuffer, extend, undefined, (err, done) => {
      if (err) return reject(err);
      resolve(done);
    });
  });
};

export const saveBufferToFile = (buffer, relativePath) => {
  const absolute = path.resolve(relativePath);
  const dir = path.dirname(absolute);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(absolute, buffer);
  return absolute;
};

export default { convertDocxBufferToPdf, saveBufferToFile };
