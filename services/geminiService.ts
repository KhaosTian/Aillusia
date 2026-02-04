
import { GoogleGenAI, Type } from "@google/genai";
import { Chapter, Rule, WorldEntity, EventLog, ChatMessage, AIConfig } from "../types";

// Helper to create a client with dynamic key
const getClient = (apiKey?: string) => {
    // Priority: Explicit key > Environment variable
    const key = apiKey || process.env.API_KEY;
    if (!key) throw new Error("API Key not found");
    return new GoogleGenAI({ apiKey: key });
};

// Helper to format context (Exported for Context Browser)
export const getContextPreview = (
  worldEntities: WorldEntity[], 
  rules: Rule[], 
  events: EventLog[],
  globalOutline: string = "",
  chapterOutline: string = "",
  localRules: string = "", // New Parameter
  previousContent: string = "",
  chapterTitle: string = ""
) => {
  const activeRules = rules.filter(r => r.isActive).map(r => `- ${r.content}`).join('\n');
  const worldContext = worldEntities.map(w => `${w.name} [${(w.aliases || []).join(', ')}]: ${w.description}`).join('\n');
  const eventTimeline = events.map(e => `- ${e.content}`).join('\n');
  
  return `=== 1. 全局核心约束 (GLOBAL RULES) ===
${activeRules || "无特殊限制。"}

=== 2. 本章特别规则 (CHAPTER LOCAL RULES) ===
${localRules || "无本章特别约束。"}

=== 3. 世界观设定 (WORLD DATABASE) ===
${worldContext || "无详细设定。"}

=== 4. 全局故事大纲 (GLOBAL OUTLINE) ===
${globalOutline || "暂无全局大纲。"}

=== 5. 当前章节大纲 (CHAPTER OUTLINE) ===
${chapterOutline || "本章暂无大纲。"}

=== 6. 事件时间轴 (EVENTS - AI 智能检索) ===
${eventTimeline || "暂无事件记录。"}

=== 7. 前文情境 (PREVIOUS CONTEXT) ===
"""
${previousContent || "（无前文或正文回溯窗口为0）"}
"""

=== 8. 当前任务 ===
章节: ${chapterTitle}
`;
};

// --- Connection Test ---
export const testAIConnection = async (config: AIConfig): Promise<boolean> => {
    try {
        const ai = getClient(config.apiKey);
        // Use a lightweight model for testing if possible, or the user specified one
        const model = config.modelName || 'gemini-3-flash-preview';
        await ai.models.generateContent({
            model: model,
            contents: "Hi",
        });
        return true;
    } catch (e) {
        console.error("Connection Test Failed:", e);
        throw e;
    }
};

// --- Streaming Story Generation ---
export const streamStoryContent = async function* (
  prompt: string,
  chapter: Chapter,
  previousContent: string,
  worldEntities: WorldEntity[],
  rules: Rule[],
  events: EventLog[],
  globalOutline: string, 
  aiConfig?: AIConfig // Accept config
) {
  const ai = getClient(aiConfig?.apiKey);
  const preview = getContextPreview(
      worldEntities, 
      rules, 
      events, 
      globalOutline, 
      chapter.outline,
      chapter.localRules, // Pass local rules
      previousContent, 
      chapter.title
  );

  const fullPrompt = `
    你是一位专业的网文小说家。请根据提供的上下文撰写小说正文。
    请使用中文进行创作。
    
    ${preview}
    
    === 用户指令 ===
    ${prompt}
    
    要求：
    1. 风格统一，逻辑严密，严格遵守设定。
    2. 承接前文情境，不要出现断层。
    3. 特别注意遵守“本章特别规则”。
    4. 只输出正文，不要包含解释。
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: aiConfig?.modelName || 'gemini-3-flash-preview',
      contents: fullPrompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    for await (const chunk of responseStream) {
       yield chunk.text;
    }

  } catch (error) {
    console.error("Gemini Streaming Error:", error);
    throw new Error("生成失败，请重试。");
  }
};

// --- Outline Chat Discussion ---
export const streamOutlineChat = async function* (
    userMessage: string,
    history: ChatMessage[],
    chapterTitle: string,
    worldEntities: WorldEntity[],
    rules: Rule[],
    events: EventLog[],
    globalOutline: string,
    previousContent: string,
    aiConfig?: AIConfig
) {
    const ai = getClient(aiConfig?.apiKey);
    // Reuse format logic where possible, but chat needs a specific persona prompt
    const { worldContext } = { worldContext: worldEntities.map(w => `${w.name} (${w.type}): ${w.description}`).join('\n') };
    const activeRules = rules.filter(r => r.isActive).map(r => `- ${r.content}`).join('\n');
    const eventTimeline = events.map(e => `- ${e.content}`).join('\n');

    const systemPrompt = `
    你是一位专业的小说大纲策划顾问。你正在与作者讨论章节 "${chapterTitle}" 的剧情。
    
    === 上下文参考 ===
    1. 世界观: 
    ${worldContext}
    
    2. 全局大纲:
    ${globalOutline}
    
    3. 事件流:
    ${eventTimeline}
    
    4. 写作规则:
    ${activeRules}
    
    5. 前文情境:
    """
    ${previousContent || "无前文。"}
    """
    
    请以对话的方式帮助作者构思情节。
    
    **重要：如果你想向用户提供几个剧情发展选项，请务必使用以下格式包裹选项JSON：**
    :::choices
    ["选项一", "选项二"]
    :::
    除选项外，请正常对话。
    `;
    
    const conversation = history.map(h => `${h.role === 'user' ? '作者' : 'AI策划'}: ${h.text}`).join('\n');
    
    const fullInput = `
    ${systemPrompt}
    === 历史对话 ===
    ${conversation}
    作者: ${userMessage}
    AI策划: 
    `;

    try {
        const responseStream = await ai.models.generateContentStream({
            model: aiConfig?.modelName || 'gemini-3-flash-preview',
            contents: fullInput
        });
        
        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (e) {
        console.error(e);
        throw e;
    }
};

// --- Extract Outline from Chat ---
export const generateOutlineFromChat = async (
    history: ChatMessage[],
    chapterTitle: string,
    aiConfig?: AIConfig
): Promise<string> => {
    const ai = getClient(aiConfig?.apiKey);
    const conversation = history.map(h => `${h.role === 'user' ? '作者' : 'AI策划'}: ${h.text}`).join('\n');
    
    try {
        const response = await ai.models.generateContent({
            model: aiConfig?.modelName || 'gemini-3-flash-preview',
            contents: `
            阅读以下关于章节 "${chapterTitle}" 的策划讨论记录：
            ${conversation}
            请总结并生成一份结构清晰的Markdown格式章节大纲。
            `
        });
        return response.text || "";
    } catch (e) {
        return "大纲提取失败。";
    }
};

// --- Analyze Chapter Content (Entities Only) ---
export const analyzeChapterContent = async (
    content: string,
    existingEntities: WorldEntity[],
    aiConfig?: AIConfig
) => {
    const ai = getClient(aiConfig?.apiKey);
    const existingNames = existingEntities.map(e => e.name).join(', ');

    const prompt = `
    分析以下小说章节内容。提取**新出现**的或**发生重大变化**的角色、地点、物品。
    
    已知设定: ${existingNames}
    
    **关键规则：**
    1. 【严禁翻译】：如果原文是中文名，不要加英文括号。必须与原文**完全一致**。
    2. 【严禁多余备注】：不要把职业、身份写在名字里（例如“义体医生凯尔”错误，应为“凯尔”）。
    3. 【提取别名】：如果一个角色有多个称呼，请将其他称呼放入 aliases 列表。
    4. 【去重】：如果实体已在“已知设定”中，且没有重大变化，请不要重复提取。
    
    请返回 JSON 格式。
    
    === 小说正文 ===
    ${content}
    `;

    try {
        const response = await ai.models.generateContent({
            model: aiConfig?.modelName || 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        newEntities: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: "EXACT text from story. No translations." },
                                    aliases: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Other names used in text" },
                                    type: { type: Type.STRING, description: "CHARACTER, SETTING, or ITEM" },
                                    description: { type: Type.STRING }
                                },
                                required: ["name", "type", "description"]
                            }
                        }
                    },
                    required: ["newEntities"]
                }
            }
        });
        
        return JSON.parse(response.text || "{}");
    } catch (e) {
        console.error("Analysis failed", e);
        throw new Error("分析失败");
    }
};

// --- Generate Section Summary (Event List) ---
export const summarizeSectionForEvent = async (
    sectionContent: string,
    aiConfig?: AIConfig
): Promise<string[]> => {
    if (!sectionContent || sectionContent.length < 50) return [];
    
    const ai = getClient(aiConfig?.apiKey);
    const prompt = `
    请分析以下小说片段，提取出所有的**关键剧情事件**（Event List）。
    
    要求：
    1. **细粒度拆分**：不要把所有内容合并成一句话。请根据剧情发展，按时间顺序拆分为 2 到 6 个独立的事件点。
    2. **动作导向**：每个事件应描述具体的动作、对话转折或心理变化（例如：“凯尔拔枪射击”、“反派倒地身亡”、“主角意识到被骗”）。
    3. **简洁**：每个事件控制在 15-20 字以内。
    
    请直接返回 JSON 字符串数组，例如：["凯尔进入拉面摊", "老鼠带着重伤出现", "老鼠交付芯片后身亡"]。
    
    === 片段 ===
    ${sectionContent}
    `;

    try {
        const response = await ai.models.generateContent({
            model: aiConfig?.modelName || 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        
        const result = JSON.parse(response.text || "[]");
        return Array.isArray(result) ? result : [];
    } catch (e) {
        console.error("Event generation failed", e);
        return [];
    }
};

// --- Proofreading ---
export const proofreadText = async (text: string, aiConfig?: AIConfig): Promise<string> => {
    const ai = getClient(aiConfig?.apiKey);
    const prompt = `
    你是一个严谨的文字校对员。请对以下小说段落进行【基础纠错】。
    
    严格遵守以下原则：
    1. **仅**修正错别字 (Typos) 和明显的标点符号错误。
    2. **严禁**润色、改写、扩写或“优化”原文的遣词造句。
    3. **严禁**改变原文的语气、风格或意图。
    4. 如果原文没有明显错误，请原样返回。
    
    输出要求：
    - 直接输出校对后的完整正文。
    - 不要包含 "好的"、"校对如下" 或 Markdown 代码块标记。
    - 保持段落结构完全一致。
    
    === 原文 ===
    ${text}
    `;

    try {
        const response = await ai.models.generateContent({
            model: aiConfig?.modelName || 'gemini-3-flash-preview',
            contents: prompt
        });
        // Clean up potential markdown wrappers just in case
        let result = response.text?.trim() || text;
        if (result.startsWith('```')) {
            result = result.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
        }
        return result;
    } catch (e) {
        console.error("Proofread failed", e);
        throw e;
    }
};

// --- Generate Cover Image ---
export const generateCoverImage = async (
    prompt: string,
    style: string = "Cinematic, High Detail",
    aiConfig?: AIConfig
): Promise<string> => {
    const ai = getClient(aiConfig?.apiKey);
    const fullPrompt = `Book cover illustration, ${prompt}, style: ${style}, vertical aspect ratio, high resolution, masterpiece, no text.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', // Specific image model
            contents: {
                parts: [{ text: fullPrompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "3:4", // Closest to 2:3 book ratio
                }
            }
        });

        // Iterate to find image part
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const base64String = part.inlineData.data;
                return `data:image/png;base64,${base64String}`;
            }
        }
        throw new Error("No image data received");
    } catch (e) {
        console.error("Image generation failed", e);
        throw e;
    }
};
