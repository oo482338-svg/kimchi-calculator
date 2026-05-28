# 優波韓式泡菜訂單計算機

線上泡菜訂單計算工具，支援 LINE LIFF 集成。

## 功能

- 🥬 選購泡菜商品（大/小罐）
- 📦 自動計算運費
- 🎁 團購優惠（滿6罐）
- 📱 LINE LIFF 集成，直接傳送訂單
- 📋 複製訂單到剪貼簿

## 快速開始

### 環境要求
- Node.js 18+
- npm 或 yarn

### 本地開發

```bash
# 安裝依賴
npm install

# 複製環境變數範本
cp .env.local.example .env.local

# 編輯 .env.local，填入你的 LIFF_ID
# NEXT_PUBLIC_LIFF_ID=你的LIFF_ID

# 開發伺服器
npm run dev

# 打開 http://localhost:3000
```

### 部署到 Vercel

1. Push 程式碼到 GitHub
2. 在 Vercel 連接此 Repository
3. 設定環境變數 `NEXT_PUBLIC_LIFF_ID`
4. 部署完成！

## LINE LIFF 設定

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 選擇你的 Bot Channel
3. 進入 LIFF 設定
4. 建立新 LIFF App：
   - 名稱：`泡菜訂單計算機`
   - URL：`https://your-domain.vercel.app`
   - 權限：`profile`, `chat_message.write`
5. 複製 LIFF ID 到環境變數

## 專案結構

```
.
├── app/
│   ├── page.tsx          # 主頁面
│   ├── layout.tsx        # 根佈局
│   └── globals.css       # 全局樣式
├── public/               # 靜態資源
├── .env.local.example    # 環境變數範本
├── next.config.js        # Next.js 配置
├── tsconfig.json         # TypeScript 配置
└── package.json          # 依賴管理
```

## 技術棧

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Inline CSS (Tailwind 可選)
- **API**: LINE LIFF SDK

## License

MIT
