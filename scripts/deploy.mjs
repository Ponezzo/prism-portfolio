import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: 'inherit', shell: true });
}

run('node scripts/bump-deploy-version.mjs');
run('npm run apply:all');
run('git add -A');
run('git diff --cached --quiet || git commit -m "Revert external project pages; restore detail overlay and cover preview"');
run('git push origin main');
