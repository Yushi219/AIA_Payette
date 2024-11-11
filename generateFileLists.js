const fs = require('fs');
const path = require('path');

// 要处理的文件夹根目录
const rootDirectories = [
  path.join(__dirname, 'public/Tool'),
  path.join(__dirname, 'public/Project'),
];

// 支持的文件扩展名
const extensions = ['png', 'jpg', 'jpeg', 'gif', 'mp4', 'webm'];

function generateFileList(dir) {
  const folders = fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory());

  folders.forEach(folder => {
    const folderPath = path.join(dir, folder.name);
    const files = fs.readdirSync(folderPath).filter(file => {
      const ext = file.split('.').pop().toLowerCase();
      return extensions.includes(ext);
    });

    // 按文件名中的数字排序
    files.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0], 10) || 0;
      const numB = parseInt(b.match(/\d+/)?.[0], 10) || 0;
      return numA - numB;
    });

    const jsonPath = path.join(folderPath, 'file-list.json');
    fs.writeFileSync(jsonPath, JSON.stringify(files, null, 2)); // 写入文件
    console.log(`Generated file-list.json for ${folder.name} in ${dir}`);
  });
}


// 对每个根目录生成 file-list.json
rootDirectories.forEach(directory => {
  if (fs.existsSync(directory)) {
    generateFileList(directory);
  } else {
    console.warn(`Directory not found: ${directory}`);
  }
});
