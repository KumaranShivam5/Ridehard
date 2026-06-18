import fs from 'fs';
import path from 'path';

function replaceInDir(dir: string, find: string, replace: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath, find, replace);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(find)) {
        content = content.split(find).join(replace);
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceInDir('src', '1E4620', '1B3C1F'); // Switch previous rigid dark green to a deep pine green
