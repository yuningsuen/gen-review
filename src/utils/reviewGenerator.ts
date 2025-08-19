/**
 * 评论生成和剪贴板工具函数
 */

import { Review, ReviewsResponse } from "@/services/reviewScraper";

interface ReviewResponse {
  success: boolean;
  review: string;
  platform: string;
}

export class ReviewGenerator {
  /**
   * 获取真实评论数据用于AI学习
   */
  static async fetchRealReviews(platform: string): Promise<Review[]> {
    try {
      const config = {
        "google-maps": { placeId: process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID },
        yelp: { businessId: process.env.NEXT_PUBLIC_YELP_BUSINESS_ID },
      };

      const platformConfig = config[platform as keyof typeof config];
      if (!platformConfig) {
        console.warn(`No configuration found for platform: ${platform}`);
        return [];
      }

      const response = await fetch("/api/fetch-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ platform, config: platformConfig }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ReviewsResponse = await response.json();
      return data.success ? data.reviews : [];
    } catch (error) {
      console.error("Error fetching real reviews:", error);
      return [];
    }
  }

  /**
   * 基于真实评论生成新评论
   */
  static async generateReviewFromRealData(platform: string): Promise<string> {
    try {
      const realReviews = await this.fetchRealReviews(platform);

      if (realReviews.length > 0) {
        // 分析真实评论，提取常见主题和表达方式
        const positiveReviews = realReviews.filter((r) => r.rating >= 4);
        const commonPhrases = this.extractCommonPhrases(positiveReviews);
        const reviewStyle = this.analyzeReviewStyle(positiveReviews);

        // 基于分析结果生成新评论
        return this.generateReviewBasedOnAnalysis(
          commonPhrases,
          reviewStyle,
          platform
        );
      } else {
        // 降级到预设模板
        return this.generateReviewSync(platform);
      }
    } catch (error) {
      console.error("Error generating review from real data:", error);
      return this.generateReviewSync(platform);
    }
  }

  /**
   * 提取常见短语和关键词
   */
  static extractCommonPhrases(reviews: Review[]): string[] {
    const allText = reviews
      .map((r) => r.text)
      .join(" ")
      .toLowerCase();

    // 常见的餐厅相关关键词
    const restaurantKeywords = [
      "service",
      "staff",
      "food",
      "delicious",
      "fresh",
      "hot",
      "spicy",
      "clean",
      "atmosphere",
      "recommend",
      "amazing",
      "excellent",
      "great",
      "perfect",
      "love",
      "best",
      "quality",
      "experience",
      "friendly",
    ];

    return restaurantKeywords.filter((keyword) => allText.includes(keyword));
  }

  /**
   * 分析评论风格
   */
  static analyzeReviewStyle(reviews: Review[]): {
    averageLength: number;
    commonStarters: string[];
    commonEnders: string[];
    isFirstPerson: boolean;
  } {
    const texts = reviews.map((r) => r.text);
    const averageLength =
      texts.reduce((sum, text) => sum + text.length, 0) / texts.length;

    // 提取开头和结尾的常见表达
    const starters = texts.map((text) => text.split(".")[0]).slice(0, 5);
    const enders = texts
      .map((text) => {
        const sentences = text.split(".");
        return (
          sentences[sentences.length - 1] || sentences[sentences.length - 2]
        );
      })
      .slice(0, 5);

    // 检测是否多使用第一人称
    const firstPersonCount = texts.filter(
      (text) =>
        text.toLowerCase().includes("i ") || text.toLowerCase().includes("我")
    ).length;

    return {
      averageLength,
      commonStarters: starters,
      commonEnders: enders,
      isFirstPerson: firstPersonCount / texts.length > 0.5,
    };
  }

  /**
   * 基于分析结果生成评论
   */
  static generateReviewBasedOnAnalysis(
    phrases: string[],
    style: {
      averageLength: number;
      commonStarters: string[];
      commonEnders: string[];
      isFirstPerson: boolean;
    },
    platform: string
  ): string {
    // 这里可以实现更复杂的AI生成逻辑
    // 目前使用增强版的模板系统

    const enhancedTemplates = {
      "google-maps": [
        `刚刚在这里用餐，体验真的很棒！${
          phrases.includes("service") ? "服务" : ""
        }${phrases.includes("staff") ? "员工" : ""}态度超好，食材${
          phrases.includes("fresh") ? "新鲜" : "很好"
        }，汤底味道正宗。${
          phrases.includes("recommend") ? "强烈推荐！" : "会再来的！"
        }`,
        `和家人一起来的，环境很不错，服务很贴心。${
          phrases.includes("quality") ? "质量" : ""
        }很好，${phrases.includes("experience") ? "体验" : "感觉"}很满意！`,
      ],
      yelp: [
        `${
          phrases.includes("amazing") ? "Amazing" : "Great"
        } hotpot experience! The service was ${
          phrases.includes("excellent") ? "excellent" : "great"
        } and ingredients were ${
          phrases.includes("fresh") ? "incredibly fresh" : "high quality"
        }. ${
          phrases.includes("recommend")
            ? "Definitely recommend!"
            : "Will come back!"
        }`,
        `${
          phrases.includes("perfect") ? "Perfect" : "Great"
        } spot for family gatherings. Staff was ${
          phrases.includes("friendly") ? "super friendly" : "very helpful"
        }. ${
          phrases.includes("quality")
            ? "Quality exceeded expectations"
            : "Great experience overall"
        }!`,
      ],
      tripadvisor: [
        `${
          phrases.includes("exceptional") ? "Exceptional" : "Great"
        } hotpot restaurant! ${
          phrases.includes("authentic") ? "Authentic flavors" : "Great taste"
        }, ${
          phrases.includes("quality")
            ? "premium ingredients"
            : "fresh ingredients"
        }, and ${
          phrases.includes("excellent")
            ? "outstanding service"
            : "great service"
        }. ${
          phrases.includes("recommend") ? "Must visit!" : "Highly recommended!"
        }`,
      ],
      opentable: [
        `Smooth reservation process and ${
          phrases.includes("excellent") ? "excellent" : "great"
        } dining experience! ${
          phrases.includes("quality")
            ? "Food quality was outstanding"
            : "Great food"
        } and service was ${
          phrases.includes("professional") ? "professional" : "great"
        }. ${
          phrases.includes("recommend")
            ? "Will definitely book again!"
            : "Highly recommend!"
        }`,
      ],
    };

    const templates =
      enhancedTemplates[platform as keyof typeof enhancedTemplates] ||
      enhancedTemplates["google-maps"];
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }
  /**
   * 同步生成评论（不需要API调用，直接返回预设模板）
   */
  static generateReviewSync(platform: string): string {
    const platformTemplates = {
      "google-maps": [
        "刚刚在这里用餐，体验真的很棒！服务员态度超好，食材新鲜，汤底味道正宗。特别喜欢他们的手工拉面表演，孩子们看得津津有味。强烈推荐！",
        "和家人一起来的，环境很不错，服务很贴心。点餐系统很方便，上菜速度也快。食材质量很好，尤其是他们家的牛肉片，切得很薄很新鲜。会再来的！",
        "朋友推荐来的，确实没有失望。汤底选择很多，我们点的番茄汤底和麻辣汤底都很好喝。服务员很专业，会主动介绍菜品。整体体验很满意！",
      ],
      yelp: [
        "Amazing hotpot experience! The service was top-notch and ingredients were incredibly fresh. Love how they pay attention to every detail. The hand-pulled noodle show was entertaining too. Definitely coming back!",
        "Perfect spot for family gatherings. Staff was super friendly and accommodating. The ordering system is so convenient and efficient. Food quality exceeded expectations. Highly recommend this place!",
        "Outstanding dining experience! The broth was flavorful and rich. Service was impeccable - our server was knowledgeable and attentive. Fresh ingredients and great atmosphere. 5 stars!",
      ],
      tripadvisor: [
        "Exceptional hotpot restaurant in Brentwood! Authentic flavors, premium ingredients, and outstanding service. The staff went above and beyond to ensure we had a memorable dining experience. Must visit!",
        "Incredible culinary experience! The variety of ingredients is impressive and everything tastes fresh. Professional service and clean environment. Perfect for special occasions or casual dining.",
        "Fantastic restaurant with authentic Sichuan hotpot. The service team is well-trained and attentive. Great value for the quality you get. Definitely one of the best hotpot places in the area!",
      ],
      opentable: [
        "Smooth reservation process and excellent dining experience! The staff was prepared for our arrival and everything went seamlessly. Food quality was outstanding and service was professional. Will definitely book again!",
        "Easy booking through OpenTable and the restaurant honored our reservation perfectly. Great hotpot experience with fresh ingredients and attentive service. Highly recommend making a reservation here!",
        "Perfect reservation experience! The restaurant was ready for us upon arrival. Excellent service throughout the meal and the food quality was top-notch. Great for date nights or family dinners!",
      ],
    };

    const templates =
      platformTemplates[platform as keyof typeof platformTemplates] ||
      platformTemplates["google-maps"];
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }

  /**
   * 生成并复制评论到剪贴板（异步版本，保留用于其他用途）
   */
  static async generateAndCopyReview(platform: string): Promise<string> {
    try {
      // 调用API生成评论
      const response = await fetch("/api/generate-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ platform }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ReviewResponse = await response.json();

      if (!data.success) {
        throw new Error("Failed to generate review");
      }

      // 复制到剪贴板
      await this.copyToClipboard(data.review);

      return data.review;
    } catch (error) {
      console.error("Error generating review:", error);
      throw error;
    }
  }

  /**
   * 复制文本到剪贴板
   */
  static async copyToClipboard(text: string): Promise<void> {
    console.log(
      "Attempting to copy to clipboard:",
      text.substring(0, 50) + "..."
    );

    try {
      // 检查是否支持现代 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        console.log("Using modern Clipboard API");
        await navigator.clipboard.writeText(text);
        console.log("Successfully copied using Clipboard API");
      } else {
        console.log("Using fallback copy method");
        // 降级到传统方法
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        textArea.style.opacity = "0";
        textArea.style.zIndex = "-1";
        document.body.appendChild(textArea);

        // 移动设备需要特殊处理
        textArea.focus();
        textArea.select();

        // 尝试选择全部文本（移动设备兼容性）
        textArea.setSelectionRange(0, 99999);

        try {
          const successful = document.execCommand("copy");
          console.log("Copy command successful:", successful);
          if (!successful) {
            throw new Error("Copy command failed");
          }
        } catch (error) {
          console.error("Failed to copy using fallback method:", error);
          throw new Error("Failed to copy to clipboard");
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      throw error;
    }
  }

  /**
   * 显示成功提示
   */
  static showSuccessNotification(platform: string): void {
    // 创建简单的提示框
    const notification = document.createElement("div");
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10B981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
      ">
        ✅ ${this.getPlatformDisplayName(platform)} 评论已生成并复制到剪贴板！
      </div>
      <style>
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      </style>
    `;

    document.body.appendChild(notification);

    // 3秒后自动移除
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  /**
   * 显示错误提示
   */
  static showErrorNotification(error: string): void {
    const notification = document.createElement("div");
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #EF4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
      ">
        ❌ ${error}
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  /**
   * 显示手动复制弹窗
   */
  static showManualCopyModal(
    review: string,
    platform: string,
    onCopyComplete?: () => void
  ): void {
    const modal = document.createElement("div");
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 20000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        ">
          <h3 style="
            margin: 0 0 16px 0;
            color: #1F2937;
            font-size: 18px;
            font-weight: 600;
          ">📝 ${this.getPlatformDisplayName(platform)} 评论已生成</h3>
          
          <p style="
            margin: 0 0 16px 0;
            color: #6B7280;
            font-size: 14px;
          ">自动复制失败，请手动复制下面的评论：</p>
          
          <textarea 
            id="reviewText" 
            readonly
            style="
              width: 100%;
              height: 120px;
              padding: 12px;
              border: 2px solid #E5E7EB;
              border-radius: 8px;
              font-size: 14px;
              line-height: 1.5;
              resize: none;
              box-sizing: border-box;
              font-family: system-ui, -apple-system, sans-serif;
            "
          >${review}</textarea>
          
          <div style="
            display: flex;
            gap: 12px;
            margin-top: 20px;
            justify-content: flex-end;
          ">
            <button 
              id="copyButton"
              style="
                background: #3B82F6;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
              "
            >复制</button>
            <button 
              id="closeButton"
              style="
                background: #6B7280;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
              "
            >关闭</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // 添加事件监听器
    const copyButton = modal.querySelector("#copyButton");
    const closeButton = modal.querySelector("#closeButton");
    const textarea = modal.querySelector("#reviewText") as HTMLTextAreaElement;

    copyButton?.addEventListener("click", async () => {
      try {
        textarea.select();
        await navigator.clipboard.writeText(review);
        (copyButton as HTMLElement).textContent = "已复制!";
        (copyButton as HTMLElement).style.background = "#10B981";

        // 复制成功后执行回调（跳转到平台）
        setTimeout(() => {
          modal.remove();
          if (onCopyComplete) {
            onCopyComplete();
          }
        }, 1000);
      } catch {
        // 降级到传统复制方法
        textarea.select();
        document.execCommand("copy");
        (copyButton as HTMLElement).textContent = "已复制!";
        (copyButton as HTMLElement).style.background = "#10B981";

        // 复制成功后执行回调（跳转到平台）
        setTimeout(() => {
          modal.remove();
          if (onCopyComplete) {
            onCopyComplete();
          }
        }, 1000);
      }
    });

    closeButton?.addEventListener("click", () => {
      modal.remove();
    });

    // 点击背景关闭
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // 自动选中文本
    setTimeout(() => {
      textarea.select();
    }, 100);
  }

  /**
   * 获取平台显示名称
   */
  private static getPlatformDisplayName(platform: string): string {
    const displayNames: Record<string, string> = {
      "google-maps": "Google Maps",
      yelp: "Yelp",
      tripadvisor: "TripAdvisor",
      opentable: "OpenTable",
    };
    return displayNames[platform] || platform;
  }
}
