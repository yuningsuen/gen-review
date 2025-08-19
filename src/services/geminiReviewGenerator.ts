/**
 * AI评论生成服务 - 使用Google Gemini
 */

import { GoogleReview } from "./simpleReviewFetcher";

export interface AIReviewRequest {
  platform: "google-maps" | "yelp" | "tripadvisor" | "opentable";
  existingReviews: GoogleReview[] | string[];
  businessName?: string;
  businessType?: string;
}

export interface AIReviewResponse {
  success: boolean;
  generatedReview: string;
  error?: string;
}

export class GeminiReviewGenerator {
  /**
   * 生成AI评论
   */
  static async generateReview(request: AIReviewRequest): Promise<string> {
    try {
      const response = await fetch("/api/ai-generate-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate review");
      }

      return data.generatedReview;
    } catch (error) {
      console.error("Error generating review:", error);
      throw new Error(
        "Failed to generate review: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  }

  /**
   * 构建AI提示词
   */
  static buildPrompt(request: AIReviewRequest): string {
    const {
      platform,
      existingReviews,
      businessName = "这家餐厅",
      businessType = "火锅店",
    } = request;

    // 获取平台特定的指导
    const platformGuidance = this.getPlatformGuidance(platform);

    // 处理评论数据 - 转换为字符串格式
    const reviewTexts = this.extractReviewTexts(existingReviews);

    // 构建现有评论的上下文
    const reviewsContext =
      reviewTexts.length > 0
        ? `现有评论示例：\n${reviewTexts.slice(0, 5).join("\n\n")}\n\n`
        : "";

    const prompt = `你是一个专业的餐厅评论写手。请基于以下信息为"${businessName}"(${businessType})生成一条真实、自然的${platformGuidance.platformName}评论：

${reviewsContext}请生成一条符合以下要求的评论：

${platformGuidance.requirements}

注意事项：
- 评论要真实自然，避免过于夸张
- 语言风格要符合该平台的用户习惯
- 长度适中，不要太长或太短
- 体现出真实的用餐体验
- 可以提及具体的菜品、服务或环境细节

请直接生成评论内容，不需要额外说明：`;

    return prompt;
  }

  /**
   * 从评论数据中提取文本内容
   */
  private static extractReviewTexts(
    reviews: GoogleReview[] | string[]
  ): string[] {
    if (reviews.length === 0) return [];

    // 如果是字符串数组，直接返回
    if (typeof reviews[0] === "string") {
      return reviews as string[];
    }

    // 如果是GoogleReview对象数组，提取文本
    return (reviews as GoogleReview[])
      .map((review) => {
        // 优先使用新API格式的文本
        if (review.text?.text) {
          return review.text.text;
        }
        // 回退到原始文本格式
        if (review.originalText?.text) {
          return review.originalText.text;
        }
        // 如果都没有，返回空字符串
        return "";
      })
      .filter((text) => text.trim().length > 0); // 过滤空文本
  }

  /**
   * 获取平台特定的指导信息
   */
  private static getPlatformGuidance(platform: string) {
    const guidance = {
      "google-maps": {
        platformName: "Google Maps",
        requirements: `
- 使用英文撰写
- 语气亲切自然，像朋友推荐
- 可以提及服务、食物质量、环境氛围
- 长度控制在50-150字
- 可以提及是否推荐给他人
        `.trim(),
      },
      yelp: {
        platformName: "Yelp",
        requirements: `
- 使用英文撰写
- 语气友好但专业
- 详细描述食物、服务和整体体验
- 长度控制在100-200词
- 可以提及性价比和推荐度
        `.trim(),
      },
      tripadvisor: {
        platformName: "TripAdvisor",
        requirements: `
- 使用英文撰写
- 更正式的语调，面向旅游者
- 强调旅游价值和独特体验
- 长度控制在100-250词
- 可以提及地理位置和旅游推荐价值
        `.trim(),
      },
      opentable: {
        platformName: "OpenTable",
        requirements: `
- 使用英文撰写
- 重点关注预订体验和用餐服务
- 提及预订流程、准时性、服务质量
- 长度控制在80-150词
- 适合商务或特殊场合用餐
        `.trim(),
      },
    };

    return (
      guidance[platform as keyof typeof guidance] || guidance["google-maps"]
    );
  }

  /**
   * 从现有评论中提取关键信息
   */
  static analyzeExistingReviews(reviews: string[]): {
    commonKeywords: string[];
    positiveAspects: string[];
    avgLength: number;
  } {
    if (reviews.length === 0) {
      return {
        commonKeywords: [],
        positiveAspects: [],
        avgLength: 100,
      };
    }

    const allText = reviews.join(" ").toLowerCase();
    const avgLength =
      reviews.reduce((sum, review) => sum + review.length, 0) / reviews.length;

    // 提取常见正面词汇
    const positiveWords = [
      "delicious",
      "amazing",
      "excellent",
      "great",
      "wonderful",
      "perfect",
      "fresh",
      "tasty",
      "friendly",
      "professional",
      "clean",
      "cozy",
      "美味",
      "好吃",
      "新鲜",
      "优质",
      "专业",
      "友好",
      "干净",
      "舒适",
    ];

    const commonKeywords = positiveWords.filter((word) =>
      allText.includes(word.toLowerCase())
    );

    // 简单的正面方面提取
    const positiveAspects = [];
    if (allText.includes("service") || allText.includes("服务"))
      positiveAspects.push("service");
    if (
      allText.includes("food") ||
      allText.includes("食物") ||
      allText.includes("菜")
    )
      positiveAspects.push("food");
    if (allText.includes("atmosphere") || allText.includes("环境"))
      positiveAspects.push("atmosphere");
    if (allText.includes("price") || allText.includes("价格"))
      positiveAspects.push("price");

    return {
      commonKeywords,
      positiveAspects,
      avgLength: Math.round(avgLength),
    };
  }
}
