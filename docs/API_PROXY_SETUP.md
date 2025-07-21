# Notion API 代理服务器设置

由于 Notion API 密钥不能在前端直接使用（安全原因），您需要设置一个代理服务器。

## 方案一：使用 Vercel Functions（推荐）

1. 创建 `api/notion-proxy.js` 文件：

```javascript
const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

module.exports = async (req, res) => {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method, databaseId, filter, sorts } = req.body;

    switch (method) {
      case 'queryDatabase':
        const response = await notion.databases.query({
          database_id: databaseId,
          filter: filter,
          sorts: sorts,
        });
        res.status(200).json(response);
        break;
      
      default:
        res.status(400).json({ error: 'Unknown method' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

2. 部署到 Vercel 并设置环境变量。

## 方案二：使用 Netlify Functions

创建 `netlify/functions/notion-proxy.js`：

```javascript
const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

exports.handler = async (event, context) => {
  // 处理 CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    };
  }

  try {
    const { method, databaseId, filter, sorts } = JSON.parse(event.body);

    switch (method) {
      case 'queryDatabase':
        const response = await notion.databases.query({
          database_id: databaseId,
          filter: filter,
          sorts: sorts,
        });
        
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(response),
        };
      
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Unknown method' }),
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

## 方案三：使用 Express.js 本地服务器（开发用）

创建 `server.js`：

```javascript
const express = require('express');
const { Client } = require('@notionhq/client');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

app.post('/api/notion', async (req, res) => {
  try {
    const { method, databaseId, filter, sorts } = req.body;

    switch (method) {
      case 'queryDatabase':
        const response = await notion.databases.query({
          database_id: databaseId,
          filter: filter,
          sorts: sorts,
        });
        res.json(response);
        break;
      
      default:
        res.status(400).json({ error: 'Unknown method' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 更新前端代码

修改 `src/api/notion.js` 以使用代理服务器：

```javascript
export class NotionAPI {
    constructor() {
        this.apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/notion';
    }

    async queryDatabase(databaseId, filter = {}, sorts = []) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    method: 'queryDatabase',
                    databaseId,
                    filter,
                    sorts,
                }),
            });
            
            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error(`查询数据库 ${databaseId} 失败:`, error);
            throw error;
        }
    }
}
```
