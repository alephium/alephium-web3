import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deploymentsPath = path.join(__dirname, '../artifacts/ts/deployments.ts');
const content = fs.readFileSync(deploymentsPath, 'utf8');
const fixedContent = content.replace(
  /import \{ default as devnetDeployments \} from "....deployments.deployments.devnet.json";/,
  'import { default as devnetDeployments } from "../../deployments/deployments.devnet.json";'
);
fs.writeFileSync(deploymentsPath, fixedContent);