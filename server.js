const express = require('express');
const { Client } = require('@notionhq/client');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 配置CORS以允许GitHub Pages访问
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://fhyfang.github.io',
    'https://lifeos-dashboard.onrender.com' // Render部署URL
  ],
  credentials: true
};

app.use(cors(corsOptions));
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
        const queryParams = {
          database_id: databaseId,
        };
        
        // Only add filter if it's not empty
        if (filter && Object.keys(filter).length > 0) {
          queryParams.filter = filter;
        }
        
        // Only add sorts if it's not empty
        if (sorts && sorts.length > 0) {
          queryParams.sorts = sorts;
        }
        
        // Log the query for debugging
        console.log('Querying database:', databaseId);
        if (filter && Object.keys(filter).length > 0) {
          console.log('Filter:', JSON.stringify(filter, null, 2));
        }
        if (sorts && sorts.length > 0) {
          console.log('Sorts:', JSON.stringify(sorts, null, 2));
        }
        
        const queryResponse = await notion.databases.query(queryParams);
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
