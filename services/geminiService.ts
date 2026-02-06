
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Chapter, Rule, WorldEntity, EventLog, ChatMessage } from "../types";

// Helper to create a client
const getClient = () => {
    const key = process.env.API_KEY;
    if (!key) throw new Error("API Key not found in environment variables.");
    return new GoogleGenAI({ apiKey: key });
};
// Retry wrapper with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 2000
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = 
      error?.status === 429 || 
      error?.code === 429 || 
      error?.message?.includes('429') ||
      error?.status === 'RESOURCE_EXHAUSTED' ||
      error?.error?.code === 429 ||
      error?.error?.status === 'RESOURCE_EXHAUSTED';

    if (isRateLimit && retries > 0) {
      console.warn(`API Rate Limit hit. Retrying in ${delay}ms... (Attempts left: ${retries})`);
      await new Promise(r => setTimeout(r, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

// --- Chapter Analysis ---
export const analyzeChapterContent = async (text: string, existingEntities: WorldEntity[]) => {
    const ai = getClient();
    // Limit existing entities context to avoid token overflow
    const entitiesContext = existingEntities.map(e => e.name).slice(0, 100).join(', ');
    
    const prompt = `
    请深度阅读并分析以下小说章节内容。
    识别其中【新出现】或【有重大更新】的世界观实体（包含：角色 Characters, 场景 Settings, 物品 Items, 设定 Lore）。
    
    对比现有实体库：${entitiesContext}。
    
    要求：
    1. 除非实体有重大状态改变，否则不要返回已存在的实体。
    2. name (名称) 和 description (描述) 必须使用中文。
    3. description 应简洁概括该实体在本章的表现或特征。

    小说正文：
    ${text.slice(0, 30000)}
    `;

    try {
        const response = await retryWithBackoff(() => ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        newEntities: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    type: { type: Type.STRING, enum: ['CHARACTER', 'SETTING', 'ITEM', 'LORE'] },
                                    description: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        })) as GenerateContentResponse;
        
        return JSON.parse(response.text || '{ "newEntities": [] }');
    } catch (e) {
        console.error("Analysis failed", e);
        return { newEntities: [] };
    }
};

// --- Event Summarization ---
export const summarizeSectionForEvent = async (text: string): Promise<string[]> => {
    const ai = getClient();
    const prompt = `
    请总结这段小说正文的关键剧情事件。
    要求：
    1. 返回一个字符串数组。
    2. 每个事件用一句简练的中文概括。
    3. 最多提取 3 个关键事件。
    
    正文：
    ${text.slice(0, 10000)}
    `;

    try {
        const response = await retryWithBackoff(() => ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        })) as GenerateContentResponse;
        return JSON.parse(response.text || '[]');
    } catch (e) {
        console.error("Summarize failed", e);
        return [];
    }
};

// --- Outline Chat Streaming ---
export async function* streamOutlineChat(
    input: string, 
    history: ChatMessage[], 
    contextTitle: string,
    worldEntities: WorldEntity[],
    rules: Rule[],
    events: EventLog[],
    globalOutline: string,
    previousContent: string
) {
    const ai = getClient();
    
    // Explicitly defining Outline Context:
    // Global Rules Only. No Active Chapter Outline. No Local Rules.
    const contextStr = `
    Title: ${contextTitle}
    
    [GLOBAL OUTLINE]
    ${globalOutline}
    
    [WORLD SETTING DATABASE]
    ${worldEntities.slice(0, 50).map(e => `${e.name} (${e.type})`).join(', ')}
    
    [STORY FLOW EVENT DATABASE]
    ${events.slice(-5).map(e => e.content).join('; ')}
    
    [GLOBAL RULES]
    ${rules.filter(r => r.isActive).map(r => r.content).join('; ')}
    
    [PREVIOUS TEXT CONTEXT]
    ${previousContent.slice(0, 1000)}...
    `;

    const systemInstruction = `你是一位专业的小说创作顾问（大纲专家）。
    请根据上下文帮助用户构思和梳理大纲。
    始终使用中文回复。
    如果需要提供选项建议，请在回复末尾使用格式 :::choices ["选项1", "选项2"] :::。
    
    CONTEXT:
    ${contextStr}
    `;

    // Convert history for SDK
    const sdkHistory = history.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { systemInstruction },
        history: sdkHistory
    });

    const result = await retryWithBackoff(() => chat.sendMessageStream({ message: input }));
    
    for await (const chunk of (result as any)) {
        const c = chunk as GenerateContentResponse;
        yield c.text;
    }
}

// --- Generate Outline from Chat ---
export const generateOutlineFromChat = async (history: ChatMessage[], title: string): Promise<string> => {
    const ai = getClient();
    const chatText = history.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
    const prompt = `
    基于以下关于《${title}》的讨论内容，整理并生成一份结构清晰的 Markdown 格式大纲。
    请使用中文。
    
    讨论记录：
    ${chatText}
    `;

    try {
        const response = await retryWithBackoff(() => ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        })) as GenerateContentResponse;
        return response.text || '';
    } catch (e) {
        console.error("Generate outline failed", e);
        throw e;
    }
};

// --- Generate Cover Image ---
export const generateCoverImage = async (prompt: string, style: string): Promise<string> => {
    const ai = getClient();
    const fullPrompt = `Create a book cover image. Style: ${style}. Description: ${prompt}. No text.`;
    
    try {
        // Use gemini-2.5-flash-image for image generation
        const response = await retryWithBackoff(() => ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: fullPrompt }] },
            config: {
                imageConfig: { aspectRatio: '3:4' }
            }
        })) as GenerateContentResponse;

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData && part.inlineData.data) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        throw new Error("No image generated in response");
    } catch (e) {
        console.error("Cover generation failed", e);
        throw e;
    }
};
// --- Context Preview Helper (Synchronous) ---
export const getContextPreview = (
    worldEntities: WorldEntity[],
    rules: Rule[],
    events: EventLog[],
    globalOutline: string,
    chapterOutline: string,
    localRules: string,
    previousContent: string,
    chapterTitle: string
): string => {
    return `
=== SYSTEM CONTEXT PREVIEW ===

[NOVEL METADATA]
Chapter Title: ${chapterTitle}

[GLOBAL OUTLINE]
${globalOutline}

[ACTIVE CHAPTER OUTLINE]
${chapterOutline || "(Empty or N/A for Outline Mode)"}

[ACTIVE RULES]
${rules.filter(r => r.isActive).map(r => `- ${r.content}`).join('\n')}
${localRules ? `\n[LOCAL RULES (BODY CONTEXT ONLY)]\n${localRules}` : ''}

[WORLD SETTING DATABASE (${worldEntities.length})]
${worldEntities.map(e => `${e.name} [${e.type}]: ${e.description.slice(0, 50)}...`).join('\n')}

[STORY FLOW EVENT DATABASE]
${events.slice(-10).map(e => `- ${e.content}`).join('\n')}

[PREVIOUS TEXT CONTEXT]
${previousContent ? previousContent.slice(-1000) + '\n...(truncated)' : '(None)'}
    `.trim();
};
