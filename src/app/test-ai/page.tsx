"use client";

import { useState } from "react";

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  time: string;
}

export default function TestAIPage() {
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [generatedReview, setGeneratedReview] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);

  // 从环境变量获取默认的 placeId
  const defaultPlaceId =
    process.env.NEXT_PUBLIC_DEFAULT_PLACE_ID || "ChIJN1t_tDeuEmsRUsoyG83frY4"; // Google Sydney Office

  const fetchReviews = async () => {
    setIsLoadingReviews(true);
    setError(null);

    try {
      console.log("Fetching reviews...");

      const response = await fetch(
        `/api/google-reviews?placeId=${defaultPlaceId}`
      );
      const data = await response.json();

      console.log("Reviews response:", data);

      if (data.success) {
        setReviews(data.reviews || []);
      } else {
        setError(data.error || "Failed to fetch reviews");
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const generateAIReview = async () => {
    if (reviews.length === 0) {
      setError("请先获取评论数据");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedReview("");
    setMetadata(null);

    try {
      console.log("Generating AI review...");

      const requestData = {
        platform: "Google Maps",
        businessName: "测试餐厅",
        businessType: "restaurant",
        existingReviews: reviews.slice(0, 5), // 只使用前5个评论
      };

      const response = await fetch("/api/ai-generate-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log("AI generation response:", data);

      if (data.success) {
        setGeneratedReview(data.generatedReview);
        setMetadata(data.metadata);
      } else {
        setError(data.error || "Failed to generate review");
      }
    } catch (err) {
      console.error("Error generating review:", err);
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedReview) return;

    try {
      await navigator.clipboard.writeText(generatedReview);
      alert("评论已复制到剪贴板！");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("复制失败，请手动复制");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🤖 完整AI评论生成测试
          </h1>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              这个页面测试完整的流程：获取Google评论 → AI生成新评论 →
              复制到剪贴板
            </p>
            <p className="text-sm text-gray-500">
              使用的Place ID:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">
                {defaultPlaceId}
              </code>
            </p>
          </div>

          {/* 步骤1: 获取评论 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              步骤1: 获取Google评论
            </h2>
            <button
              onClick={fetchReviews}
              disabled={isLoadingReviews}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {isLoadingReviews ? "🔄 获取中..." : "📥 获取评论数据"}
            </button>

            {reviews.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-green-800 font-semibold mb-2">
                  ✅ 已获取 {reviews.length} 条评论
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {reviews.slice(0, 3).map((review, index) => (
                    <div
                      key={review.id}
                      className="bg-white p-3 rounded border text-sm"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-800">
                          {review.author}
                        </span>
                        <span className="text-yellow-500">
                          {"★".repeat(review.rating)}
                        </span>
                      </div>
                      <p className="text-gray-600 line-clamp-2">
                        {review.text}
                      </p>
                      <span className="text-xs text-gray-400">
                        {review.time}
                      </span>
                    </div>
                  ))}
                  {reviews.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      还有 {reviews.length - 3} 条评论...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 步骤2: 生成AI评论 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              步骤2: AI生成新评论
            </h2>
            <button
              onClick={generateAIReview}
              disabled={isGenerating || reviews.length === 0}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {isGenerating ? "🤖 生成中..." : "✨ 生成AI评论"}
            </button>

            {generatedReview && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-blue-800 font-semibold">🎯 生成的评论</h3>
                  <button
                    onClick={copyToClipboard}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded transition-colors"
                  >
                    📋 复制
                  </button>
                </div>
                <div className="bg-white p-4 rounded border">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {generatedReview}
                  </p>
                </div>
              </div>
            )}

            {metadata && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-gray-700 font-semibold mb-3">
                  📊 生成信息
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">模型:</span>
                    <p className="text-gray-900 font-mono">
                      {metadata.modelUsed}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">总Token:</span>
                    <p className="text-gray-900">{metadata.tokensUsed || 0}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      输入Token:
                    </span>
                    <p className="text-gray-900">
                      {metadata.promptTokens || 0}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      输出Token:
                    </span>
                    <p className="text-gray-900">
                      {metadata.responseTokens || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 错误显示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-semibold mb-2">❌ 错误</h3>
              <p className="text-red-700 whitespace-pre-wrap">{error}</p>
            </div>
          )}

          {/* 使用说明 */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-yellow-800 font-semibold mb-2">💡 使用说明</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>1. 先点击"获取评论数据"按钮获取真实的Google评论</li>
              <li>2. 然后点击"生成AI评论"让AI基于这些评论生成新的评论</li>
              <li>3. 生成后可以点击"复制"按钮将评论复制到剪贴板</li>
              <li>
                4. 系统会自动尝试不同的Gemini模型（2.5 → 1.5 Pro → 1.5 Flash）
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
