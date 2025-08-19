/**
 * 评论生成和剪贴板工具函数
 */

export class ReviewGenerator {
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
