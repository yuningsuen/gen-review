import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import {
  GeminiReviewGenerator,
  AIReviewRequest,
} from "@/services/geminiReviewGenerator";

export async function POST(request: NextRequest) {
  try {
    const requestData: AIReviewRequest = await request.json();

    // 验证请求数据
    if (!requestData.platform) {
      return NextResponse.json(
        { success: false, error: "Platform is required" },
        { status: 400 }
      );
    }

    // 检查Gemini API密钥
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // 构建提示词
    const prompt = GeminiReviewGenerator.buildPrompt(requestData);

    console.log(
      "Generating review with prompt:",
      prompt.substring(0, 200) + "..."
    );

    // 初始化 Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);

    let modelUsed = "unknown";

    // 安全设置
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    // 生成配置
    const generationConfig = {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
      thinkingConfig: {
        thinkingBudget: 0, // Disables thinking
      },
    };

    // 模型优先级列表：2.5 Flash -> 1.5 Pro -> 1.5 Flash
    const modelNames = [
      // "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
    ];

    for (const modelName of modelNames) {
      try {
        console.log(`🔄 Trying ${modelName}...`);

        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig,
          safetySettings,
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const generatedText = response.text();

        if (generatedText && generatedText.trim()) {
          modelUsed = modelName;
          console.log(`✅ ${modelName} succeeded`);

          // 清理生成的文本
          const cleanedText = generatedText
            .trim()
            .replace(/^["']|["']$/g, "") // 移除开头和结尾的引号
            .replace(/\n\s*\n/g, "\n") // 合并多个空行
            .trim();

          const tokensUsed = response.usageMetadata?.totalTokenCount || 0;
          const promptTokens = response.usageMetadata?.promptTokenCount || 0;
          const candidatesTokens =
            response.usageMetadata?.candidatesTokenCount || 0;

          console.log(
            `📊 Token usage - Total: ${tokensUsed}, Prompt: ${promptTokens}, Response: ${candidatesTokens}`
          );

          return NextResponse.json({
            success: true,
            generatedReview: cleanedText,
            metadata: {
              platform: requestData.platform,
              originalReviewsCount: requestData.existingReviews.length,
              generatedLength: cleanedText.length,
              modelUsed: modelUsed,
              tokensUsed: tokensUsed,
              promptTokens: promptTokens,
              responseTokens: candidatesTokens,
              timestamp: new Date().toISOString(),
            },
          });
        } else {
          console.log(`⚠️ ${modelName} returned empty response`);
        }
      } catch (error) {
        console.log(
          `❌ ${modelName} failed:`,
          error instanceof Error ? error.message : error
        );
        // 继续尝试下一个模型
        continue;
      }
    }

    // 如果所有模型都失败
    console.error("🚫 All Gemini models failed");
    return NextResponse.json(
      {
        success: false,
        error: "All Gemini models failed to generate content",
        details: `Tried models: ${modelNames.join(", ")}`,
        modelsAttempted: modelNames,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("💥 Error in AI review generation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
