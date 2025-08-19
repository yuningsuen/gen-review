/**
 * 简化版评论获取服务 - 专注于Google Maps (New Places API)
 */

// 新版 Places API 的评论格式
export interface GoogleReview {
  // 新版API可能使用不同的字段名
  authorAttribution?: {
    displayName: string;
    uri?: string;
    photoUri?: string;
  };
  rating?: number;
  text?: {
    text: string;
    languageCode: string;
  };
  originalText?: {
    text: string;
    languageCode: string;
  };
  relativePublishTimeDescription?: string;
  publishTime?: string;

  // 为了兼容，保留旧格式字段
  author_name?: string;
  time?: number;
  relative_time_description?: string;
}

export interface GooglePlaceReviews {
  name?: string;
  reviews: GoogleReview[];
  rating: number;
  user_ratings_total: number;
}

export class SimpleReviewFetcher {
  /**
   * 从Google Maps获取商家评论
   */
  static async getGoogleMapsReviews(
    placeId: string
  ): Promise<GooglePlaceReviews | null> {
    try {
      console.log("Fetching reviews for placeId:", placeId);

      const response = await fetch(`/api/google-reviews?placeId=${placeId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        const errorMsg = data.error || `HTTP error! status: ${response.status}`;
        const details = data.details ? ` - ${data.details}` : "";
        throw new Error(`${errorMsg}${details}`);
      }

      if (data.success) {
        // 将API返回的数据转换为期望的格式
        return {
          reviews: data.reviews || [],
        };
      } else {
        const errorMsg = data.error || "Unknown error";
        const details = data.details ? ` - ${data.details}` : "";
        throw new Error(`API Error: ${errorMsg}${details}`);
      }
    } catch (error) {
      console.error("Error fetching Google Maps reviews:", error);
      throw error; // 重新抛出错误以便上层处理
    }
  }

  /**
   * 格式化评论用于显示 - 兼容新旧API格式
   */
  static formatReviewsForDisplay(reviews: GoogleReview[]): string[] {
    return reviews.map((review) => {
      const authorName =
        review.authorAttribution?.displayName ||
        review.author_name ||
        "Anonymous";
      const rating = review.rating || 0;
      const text =
        review.text?.text ||
        review.originalText?.text ||
        (typeof review.text === "string" ? review.text : "No text");

      return `${authorName} (${rating}⭐): ${text}`;
    });
  }

  /**
   * 提取正面评论（4星及以上）
   */
  static getPositiveReviews(reviews: GoogleReview[]): GoogleReview[] {
    return reviews.filter((review) => (review.rating || 0) >= 4);
  }

  /**
   * 提取常用词汇
   */
  static extractKeywords(reviews: GoogleReview[]): string[] {
    const allTexts = reviews.map((r) => {
      // 兼容新旧API格式
      return (
        r.text?.text ||
        r.originalText?.text ||
        (typeof r.text === "string" ? r.text : "")
      );
    });

    const allText = allTexts.join(" ").toLowerCase();
    const words = allText.split(/\s+/);

    // 餐厅相关的常用词汇
    const restaurantKeywords = [
      "delicious",
      "tasty",
      "fresh",
      "hot",
      "spicy",
      "good",
      "great",
      "excellent",
      "amazing",
      "wonderful",
      "perfect",
      "best",
      "love",
      "recommend",
      "favorite",
      "service",
      "staff",
      "friendly",
      "helpful",
      "fast",
      "quick",
      "clean",
      "atmosphere",
      "environment",
      "cozy",
      "nice",
      "beautiful",
    ];

    const foundKeywords = restaurantKeywords.filter((keyword) =>
      words.some((word) => word.includes(keyword))
    );

    return [...new Set(foundKeywords)];
  }
}
