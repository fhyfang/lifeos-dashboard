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

// Notion API 代理端点
app.post('/api/notion', async (req, res) => {
  try {
    const { method, databaseId, filter, sorts, pageId, properties } = req.body;

    switch (method) {
      case 'queryDatabase':
        const queryResponse = await notion.databases.query({
          database_id: databaseId,
          filter: filter || undefined,
          sorts: sorts || undefined,
        });
        res.json(queryResponse);
        break;
      
      case 'getPage':
        const pageResponse = await notion.pages.retrieve({
          page_id: pageId,
        });
        res.json(pageResponse);
        break;
      
      case 'updatePage':
        const updateResponse = await notion.pages.update({
          page_id: pageId,
          properties: properties,
        });
        res.json(updateResponse);
        break;
      
      default:
        res.status(400).json({ error: 'Unknown method' });
    }
  } catch (error) {
    console.error('Notion API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Notion API proxy server running on port ${PORT}`);
});
