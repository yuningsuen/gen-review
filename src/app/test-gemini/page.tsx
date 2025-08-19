"use client";

import { useState } from "react";

export default function TestGeminiPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testGeminiConnection = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing Gemini API connection...");

      const testRequest = {
        platform: "Google Maps",
        businessName: "Test Restaurant",
        businessType: "restaurant",
        existingReviews: [
          {
            id: "test1",
            author: "Test User",
            rating: 5,
            text: "这家餐厅的菜品非常好吃，服务也很棒！",
            time: "1 week ago",
          },
        ],
      };

      console.log("Sending test request:", testRequest);

      const response = await fetch("/api/ai-generate-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testRequest),
      });

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Unknown error occurred");
      }
    } catch (err) {
      console.error("Error testing Gemini:", err);
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 Gemini API 连接测试
          </h1>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              点击下面的按钮测试 Gemini API 的连接性和模型可用性。
            </p>

            <button
              onClick={testGeminiConnection}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {isLoading ? "🔄 测试中..." : "🚀 测试 Gemini API"}
            </button>
          </div>

          {/* 错误显示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-semibold mb-2">❌ 错误</h3>
              <p className="text-red-700 whitespace-pre-wrap">{error}</p>
            </div>
          )}

          {/* 成功结果显示 */}
          {result && (
            <div className="space-y-6">
              {/* 生成的评论 */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-green-800 font-semibold mb-2">
                  ✅ 生成的评论
                </h3>
                <div className="bg-white p-3 rounded border">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {result.generatedReview}
                  </p>
                </div>
              </div>

              {/* 元数据 */}
              {result.metadata && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-blue-800 font-semibold mb-3">
                    📊 调用信息
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-blue-700">
                        使用模型:
                      </span>
                      <span className="ml-2 text-blue-900 font-mono">
                        {result.metadata.modelUsed}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">
                        Token使用:
                      </span>
                      <span className="ml-2 text-blue-900">
                        {result.metadata.tokensUsed || 0}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">
                        Prompt Token:
                      </span>
                      <span className="ml-2 text-blue-900">
                        {result.metadata.promptTokens || 0}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">
                        响应Token:
                      </span>
                      <span className="ml-2 text-blue-900">
                        {result.metadata.responseTokens || 0}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">
                        原始评论数:
                      </span>
                      <span className="ml-2 text-blue-900">
                        {result.metadata.originalReviewsCount}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">
                        生成长度:
                      </span>
                      <span className="ml-2 text-blue-900">
                        {result.metadata.generatedLength} 字符
                      </span>
                    </div>
                  </div>
                  {result.metadata.timestamp && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <span className="font-medium text-blue-700">
                        生成时间:
                      </span>
                      <span className="ml-2 text-blue-900 font-mono text-sm">
                        {new Date(result.metadata.timestamp).toLocaleString(
                          "zh-CN"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* 原始响应 */}
              <details className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                  🔍 查看原始响应数据
                </summary>
                <pre className="mt-3 p-3 bg-white border rounded text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
