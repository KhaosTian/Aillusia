
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { Novel } from '../types';

/**
 * Helper: Convert Base64 to Blob
 */
const base64ToBlob = (base64: string) => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

/**
 * Helper: Convert Blob/File to Base64
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const sanitizeFilename = (name: string) => name.replace(/[\/\\?%*:|"<>]/g, '_');

// --- Export Functions ---

export const exportNovelAsText = (novel: Novel) => {
    const safeTitle = sanitizeFilename(novel.title);
    let content = `# ${novel.title}\n\n`;
    if (novel.description) content += `简介：\n${novel.description}\n\n`;
    
    // Flat chapter iteration
    novel.items.forEach(chap => {
        content += `\n### ${chap.title}\n\n`;
        chap.sections.forEach(sec => content += `${sec.content}\n\n`);
    });
    
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(blob, `${safeTitle}.txt`);
};

/**
 * Export as Directory Structure (.zip)
 * Contains .txt files for chapters.
 */
export const exportNovelAsStructureZip = async (novel: Novel) => {
    const safeTitle = sanitizeFilename(novel.title);
    const zip = new JSZip();
    const rootFolder = zip.folder(safeTitle);
    
    if (!rootFolder) throw new Error("Failed to create zip folder");

    // Add Introduction
    if (novel.description) {
        rootFolder.file("00_简介.txt", novel.description);
    }

    novel.items.forEach((chap, index) => {
        const prefix = (index + 1).toString().padStart(2, '0');
        const chapContent = chap.sections.map(s => s.content).join('\n\n');
        rootFolder.file(`${prefix}_${sanitizeFilename(chap.title)}.txt`, chapContent);
    });

    const content = await zip.generateAsync({ type: "blob" });
    FileSaver.saveAs(content, `${safeTitle}_structure.zip`);
};

/**
 * Export as Aillusia Project Archive (.zip)
 * Separates images into a 'resources' folder to keep JSON light.
 */
export const exportNovelAsArchive = async (novel: Novel) => {
    const safeTitle = sanitizeFilename(novel.title);
    const zip = new JSZip();
    
    // 1. Handle Images (Extract Base64 to files)
    const resourcesFolder = zip.folder("resources");
    const novelData = JSON.parse(JSON.stringify(novel)); // Deep clone

    if (novelData.coverImage && novelData.coverImage.startsWith('data:image')) {
        const imgBlob = base64ToBlob(novelData.coverImage);
        const imgName = `cover_${Date.now()}.png`;
        resourcesFolder?.file(imgName, imgBlob);
        novelData.coverImage = `resources/${imgName}`; // Replace with relative path
    }

    // 2. Save JSON Core
    zip.file("novel.json", JSON.stringify(novelData, null, 2));

    // 4. Generate
    const content = await zip.generateAsync({ type: "blob" });
    FileSaver.saveAs(content, `${safeTitle}.ail.zip`); // .ail.zip for Aillusia Project
};

// --- Import Functions ---

export const parseImportedNovel = async (file: File): Promise<Novel> => {
    const fileName = file.name.toLowerCase();

    // 1. Handle Legacy JSON Import
    if (fileName.endsWith('.json')) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target?.result as string);
                    validateAndResolve(json, resolve);
                } catch (err) {
                    reject(new Error("Invalid JSON file"));
                }
            };
            reader.readAsText(file);
        });
    }

    // 2. Handle Project Archive (.zip)
    if (fileName.endsWith('.zip')) {
        try {
            const zip = await JSZip.loadAsync(file);
            const jsonFile = zip.file("novel.json");
            
            if (!jsonFile) throw new Error("Invalid Archive: novel.json not found");

            const jsonStr = await jsonFile.async("string");
            const novelData = JSON.parse(jsonStr);

            // Re-hydrate Images
            if (novelData.coverImage && novelData.coverImage.startsWith('resources/')) {
                const imgFile = zip.file(novelData.coverImage);
                if (imgFile) {
                    const imgBlob = await imgFile.async("blob");
                    novelData.coverImage = await blobToBase64(imgBlob);
                }
            }

            return new Promise((resolve) => validateAndResolve(novelData, resolve));

        } catch (e) {
            console.error(e);
            throw new Error("Failed to parse archive");
        }
    }

    throw new Error("Unsupported file format");
};

const validateAndResolve = (json: any, resolve: (n: Novel) => void) => {
    if (!json.id || !json.title || !Array.isArray(json.items)) {
        throw new Error("Invalid format: Missing required fields");
    }
    const newNovel: Novel = {
        ...json,
        id: `novel-import-${Date.now()}`,
        title: `${json.title} (Imported)`,
        importedAt: Date.now()
    };
    resolve(newNovel);
};
