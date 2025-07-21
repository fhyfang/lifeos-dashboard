const { Client } = require('@notionhq/client');

// 初始化 Notion 客户端
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

module.exports = async (req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://fhyfang.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
};
