const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// 提供 API 来获取媒体文件列表
app.get('/api/getMediaFiles', async (req, res) => {
  const { folderPath } = req.query;

  try {
    const absolutePath = path.resolve(__dirname, folderPath);
    const files = fs.readdirSync(absolutePath); // 列出文件夹内的所有文件
    const extensions = ['png', 'jpg', 'jpeg', 'gif', 'mp4', 'webm'];
    const mediaFiles = files.filter(file => extensions.includes(file.split('.').pop().toLowerCase()));

    res.json(mediaFiles); // 返回符合扩展名的文件列表
  } catch (error) {
    console.error('Error reading folder:', error);
    res.status(500).json({ error: 'Failed to fetch media files' });
  }
});

// 启动服务器
const PORT = 3000; // 可根据需要更改端口号
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
