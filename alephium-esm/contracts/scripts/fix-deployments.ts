const fs = require('fs');
const path = require('path');

const deploymentsPath = path.join(__dirname, '../artifacts/ts/deployments.ts');
const content = fs.readFileSync(deploymentsPath, 'utf8');
const fixedContent = content.replace(
  /import \{ default as devnetDeployments \} from "....deployments.deployments.devnet.json";/,
  'import { default as devnetDeployments } from "../../deployments/deployments.devnet.json";'
);
fs.writeFileSync(deploymentsPath, fixedContent);