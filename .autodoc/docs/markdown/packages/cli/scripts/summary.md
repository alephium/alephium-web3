[View code on GitHub](https://github.com/alephium/alephium-web3/.autodoc/docs/json/packages/cli/scripts)

The `cli/scripts` folder in the `alephium-web3` project contains several scripts that are used for various purposes such as setting up new projects, deploying smart contracts, and managing a local Alephium development network (devnet).

`copy-template.js` is a script that copies the `.gitignore` and `.npmignore` files from the root directory of the project to the `dist` subdirectory. This ensures that these files are included in the distribution package and properly ignored by Git and npm. For example, in the `package.json` file, the `build` script might run `build.js`, which includes this script to copy the necessary files:

```json
{
  "scripts": {
    "build": "node build.js",
    "prepublishOnly": "npm run build"
  }
}
```

`create-project.ts` is a script that creates a new project based on one of three templates: base, react, or Next.js. It provides a convenient way to set up a new project quickly and correctly. For example, to create a new React project, you might run:

```bash
$ alephium-web3 create-project react /path/to/package /path/to/project
```

`deploy.ts` defines a function called `deployAndSaveProgress` that deploys a smart contract and saves the deployment progress. This function is likely used in the larger project to automate the deployment process of smart contracts. Here's an example of how this function might be used:

```javascript
import { Configuration } from '../src/types'
import { deployAndSaveProgress } from '../src/deployer'
import { NetworkId } from '@alephium/web3'

const configuration: Configuration = {
  // configuration settings for deployment
}

const networkId: NetworkId = 'mainnet'

deployAndSaveProgress(configuration, networkId)
  .then(() => console.log('Deployment complete!'))
  .catch(error => console.error(error))
```

`start-devnet.js` contains code to launch and manage a local Alephium devnet for testing and development purposes. It provides a convenient way to launch and manage a local devnet and create a test wallet for use in the devnet. The main function, `startDevnet`, can be called with the version tag of the full node software and the path to the configuration file:

```javascript
const { startDevnet } = require('alephium-web3')

startDevnet('v1.0.0', '/path/to/config/file')
```

`stop-devnet.js` defines a function called `stopDevnet` that is used to stop a running Alephium devnet. This function can be called from other parts of the project or from external scripts to stop the devnet before running new tests or making changes to the devnet configuration:

```javascript
const { stopDevnet } = require('alephium-web3')

// Stop the running devnet
stopDevnet()
```

Overall, the `cli/scripts` folder contains essential scripts that facilitate various tasks in the `alephium-web3` project, such as project setup, smart contract deployment, and devnet management.
