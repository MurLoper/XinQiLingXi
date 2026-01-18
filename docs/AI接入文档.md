为每个 AI 平台实现 OAuth 登录，自动获取 API Key。

OAuth 集成示例：
jsx
// OAuthIntegration.jsx
```
function OAuthIntegration() {
  const [connectedProviders, setConnectedProviders] = useState([]);

  const handleOAuthConnect = (provider) => {
    // 重定向到 OAuth 授权页面
    const oauthUrls = {
      openai: 'https://auth.openai.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code',
      kimi: 'https://platform.moonshot.cn/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI',
      // 其他平台...
    };
    
    window.location.href = oauthUrls[provider];
  };

  const handleOAuthCallback = async (provider, code) => {
    // 处理 OAuth 回调，交换 access token
    try {
      const response = await fetch('/api/ai/oauth-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, code })
      });
      
      const data = await response.json();
      if (data.success) {
        setConnectedProviders(prev => [...prev, provider]);
      }
    } catch (error) {
      console.error('OAuth 连接失败:', error);
    }
  };

  return (
    <div className="oauth-integration">
      <h3>一键连接 AI 服务</h3>
      
      <div className="oauth-buttons">
        <button 
          className="btn-openai"
          onClick={() => handleOAuthConnect('openai')}
        >
          连接 OpenAI
        </button>
        
        <button 
          className="btn-kimi"
          onClick={() => handleOAuthConnect('kimi')}
        >
          连接 Kimi AI
        </button>
        
        <button 
          className="btn-spark"
          onClick={() => handleOAuthConnect('spark')}
        >
          连接讯飞星火
        </button>
      </div>
    </div>
  );
}
```
🔧 完整的 AI 服务管理后端
用户 AI 配置数据结构
go
```
// internal/models/ai_config.go
package models

import "time"

type UserAIConfig struct {
    ID        string    `gorm:"primaryKey" json:"id"`
    UserID    string    `gorm:"not null" json:"user_id"`
    Provider  string    `gorm:"not null" json:"provider"` // openai, kimi, spark, etc.
    APIKey    string    `gorm:"not null" json:"-"` // 不返回给前端
    BaseURL   string    `json:"base_url,omitempty"` // 自定义端点
    IsEnabled bool      `gorm:"default:true" json:"is_enabled"`
    Config    JSONB     `gorm:"type:jsonb" json:"config"` // 模型配置等
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

type AIProvider struct {
    Name         string `json:"name"`
    DisplayName  string `json:"display_name"`
    Website      string `json:"website"`
    KeyURL       string `json:"key_url"` // 获取 API Key 的链接
    SupportImage bool   `json:"support_image"` // 是否支持图像
    FreeTier     bool   `json:"free_tier"` // 是否有免费额度
    MaxTokens    int    `json:"max_tokens"` // 最大 token 数
}
```
AI 管理器实现
go
```
// pkg/ai/manager.go
package ai

import (
    "context"
    "encoding/json"
    "fmt"
)

type Manager struct {
    providers map[string]Provider
}

type Provider interface {
    Name() string
    ChatCompletion(ctx context.Context, apiKey string, messages []Message, imageURL string) (*ChatResponse, error)
    ValidateKey(ctx context.Context, apiKey string) (bool, error)
}

func (m *Manager) ProcessWithUserKey(providerName, apiKey string, messages []Message, imageURL string) (*ChatResponse, error) {
    provider, exists := m.providers[providerName]
    if !exists {
        return nil, fmt.Errorf("不支持的 AI 提供商: %s", providerName)
    }
    
    // 验证 API Key
    valid, err := provider.ValidateKey(context.Background(), apiKey)
    if err != nil || !valid {
        return nil, fmt.Errorf("API Key 无效或验证失败")
    }
    
    return provider.ChatCompletion(context.Background(), apiKey, messages, imageURL)
}

// Kimi AI 实现
type KimiProvider struct {
    baseURL string
}

func (k *KimiProvider) Name() string {
    return "kimi"
}

func (k *KimiProvider) ChatCompletion(ctx context.Context, apiKey string, messages []Message, imageURL string) (*ChatResponse, error) {
    // 调用 Kimi AI API
    // 实现具体的 HTTP 请求逻辑
    return &ChatResponse{
        Content: "Kimi AI 的回复",
        Usage:   &Usage{PromptTokens: 100, CompletionTokens: 50},
    }, nil
}
```
🎨 用户体验优化
引导用户获取免费 API Key
jsx
```
// APIKeyGuide.jsx
function APIKeyGuide({ provider }) {
  const guides = {
    kimi: {
      steps: [
        "1. 访问 Moonshot AI 平台",
        "2. 注册并完成实名认证", 
        "3. 进入 API Keys 页面",
        "4. 创建新的 API Key",
        "5. 复制并在此处粘贴"
      ],
      link: "https://platform.moonshot.cn/console/api-keys",
      freeInfo: "免费额度：每分钟 3 次请求"
    },
    spark: {
      steps: [
        "1. 访问讯飞开放平台",
        "2. 注册企业或个人账号",
        "3. 创建新应用",
        "4. 获取 API Key 和 Secret",
        "5. 在此处配置"
      ],
      link: "https://www.xfyun.cn/services/online-services",
      freeInfo: "免费额度：永久免费使用（有限制）"
    },
    zhipu: {
      steps: [
        "1. 访问智谱 AI 开放平台", 
        "2. 注册账号并认证",
        "3. 获取 API Key",
        "4. 在此处配置使用"
      ],
      link: "https://open.bigmodel.cn/",
      freeInfo: "免费额度：新用户赠送大量 tokens"
    }
  };

  const guide = guides[provider];

  return (
    <div className="api-key-guide">
      <h4>如何获取 {provider} API Key？</h4>
      <div className="steps">
        {guide.steps.map((step, index) => (
          <div key={index} className="step">{step}</div>
        ))}
      </div>
      <div className="free-info">
        <strong>免费情况：</strong>{guide.freeInfo}
      </div>
      <a href={guide.link} target="_blank" rel="noopener" className="guide-link">
        立即获取 {provider} API Key →
      </a>
    </div>
  );
}
```
🔒 安全考虑
API Key 安全存储
go
```
// pkg/security/encryption.go
package security

import (
    "crypto/aes"
    "crypto/cipher"
    "crypto/rand"
    "encoding/base64"
    "io"
)

func EncryptAPIKey(plainText, key string) (string, error) {
    block, err := aes.NewCipher([]byte(key))
    if err != nil {
        return "", err
    }
    
    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return "", err
    }
    
    nonce := make([]byte, gcm.NonceSize())
    if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
        return "", err
    }
    
    ciphertext := gcm.Seal(nonce, nonce, []byte(plainText), nil)
    return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func DecryptAPIKey(encryptedText, key string) (string, error) {
    data, err := base64.StdEncoding.DecodeString(encryptedText)
    if err != nil {
        return "", err
    }
    
    block, err := aes.NewCipher([]byte(key))
    if err != nil {
        return "", err
    }
    
    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return "", err
    }
    
    nonceSize := gcm.NonceSize()
    nonce, ciphertext := data[:nonceSize], data[nonceSize:]
    
    plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
    if err != nil {
        return "", err
    }
    
    return string(plaintext), nil
}
```
✅ 推荐实施方案
分阶段实施：
第一阶段：实现手动 API Key 配置

支持 Kimi AI、讯飞星火、智谱 AI

基本的加密存储

简单的配置界面

第二阶段：增强用户体验

API Key 验证和测试

使用量统计

多提供商自动切换

第三阶段：高级功能

OAuth 集成

自动额度监控

故障转移机制

国内推荐提供商优先级：
Kimi AI - 免费额度 + 长上下文 + 图像理解

讯飞星火 - 永久免费 + 稳定

智谱 AI - 免费 tokens + 性能好

硅基流动 - 聚合多个模型 + 免费

💡 总结
让用户自己配置 API Key 的优势：

✅ 成本为零：你不需要支付 API 费用

✅ 法律合规：用户对自己的使用负责

✅ 灵活性：用户可以选择自己喜欢的 AI 服务

✅ 可扩展性：轻松添加新的 AI 提供商

✅ 用户主权：用户完全控制自己的数据和额度

这种方案既保护了你作为开发者的利益，又给了用户最大的灵活性和选择权！