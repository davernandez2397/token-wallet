const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const config = require('./src/config');

// Token configuration
const TOKEN_NAME = 'My Test Token';
const TOKEN_SYMBOL = 'MTT';
const INITIAL_SUPPLY = 1000000; // 1 million tokens

async function deployToken() {
  console.log(chalk.cyan('\n╔══════════════════════════════════════╗'));
  console.log(chalk.cyan('║      ERC-20 Token Deployment         ║'));
  console.log(chalk.cyan('╚══════════════════════════════════════╝\n'));

  try {
    // Read wallet info from test file
    const walletInfoPath = 'test-wallet-info.txt';
    if (!fs.existsSync(walletInfoPath)) {
      console.error(chalk.red('Error: test-wallet-info.txt not found'));
      console.log(chalk.yellow('Please create a wallet first'));
      process.exit(1);
    }

    const walletInfo = fs.readFileSync(walletInfoPath, 'utf8');
    const privateKeyMatch = walletInfo.match(/Private Key: (0x[a-fA-F0-9]+)/);

    if (!privateKeyMatch) {
      console.error(chalk.red('Error: Could not find private key in wallet info'));
      process.exit(1);
    }

    const privateKey = privateKeyMatch[1];

    // Load compiled contract
    const artifactPath = path.join(__dirname, 'artifacts', 'MyToken.json');
    if (!fs.existsSync(artifactPath)) {
      console.error(chalk.red('Error: Contract not compiled'));
      console.log(chalk.yellow('Run: node compile-contract.js'));
      process.exit(1);
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

    // Connect to network
    console.log(chalk.blue('Connecting to network...'));
    const provider = new ethers.JsonRpcProvider(config.network.rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(chalk.white('Deployer address:'), chalk.cyan(wallet.address));

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const balanceInEth = ethers.formatEther(balance);
    console.log(chalk.white('Balance:'), chalk.cyan(`${balanceInEth} ETH`));

    if (balance === 0n) {
      console.error(chalk.red('\nError: Insufficient balance to deploy contract'));
      console.log(chalk.yellow('Please get testnet ETH from a faucet'));
      process.exit(1);
    }

    console.log(chalk.white('Network:'), chalk.cyan(config.network.name));
    console.log(chalk.white('Token Name:'), chalk.cyan(TOKEN_NAME));
    console.log(chalk.white('Token Symbol:'), chalk.cyan(TOKEN_SYMBOL));
    console.log(chalk.white('Initial Supply:'), chalk.cyan(`${INITIAL_SUPPLY.toLocaleString()} ${TOKEN_SYMBOL}`));

    // Create contract factory
    console.log(chalk.blue('\nPreparing contract deployment...'));
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

    // Estimate deployment cost
    const deployTx = await factory.getDeployTransaction(TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY);
    const gasEstimate = await provider.estimateGas(deployTx);
    const feeData = await provider.getFeeData();
    const gasCost = gasEstimate * feeData.gasPrice;
    const gasCostInEth = ethers.formatEther(gasCost);

    console.log(chalk.gray(`Estimated gas: ${gasEstimate.toString()}`));
    console.log(chalk.gray(`Gas price: ${ethers.formatUnits(feeData.gasPrice, 'gwei')} Gwei`));
    console.log(chalk.yellow(`Deployment cost: ~${gasCostInEth} ETH\n`));

    // Deploy contract
    console.log(chalk.blue('Deploying contract...'));
    const contract = await factory.deploy(TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY);

    console.log(chalk.green('Contract deployment transaction sent!'));
    console.log(chalk.white('Transaction hash:'), chalk.cyan(contract.deploymentTransaction().hash));

    console.log(chalk.blue('\nWaiting for confirmation...'));
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();

    console.log(chalk.green('\n✓ Contract deployed successfully!'));
    console.log(chalk.white('Contract address:'), chalk.cyan(contractAddress));
    console.log(chalk.gray(`${config.network.explorerUrl}/address/${contractAddress}`));

    // Verify deployment
    console.log(chalk.blue('\nVerifying deployment...'));
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    const decimals = await contract.decimals();
    const ownerBalance = await contract.balanceOf(wallet.address);

    console.log(chalk.white('Token Name:'), chalk.cyan(name));
    console.log(chalk.white('Token Symbol:'), chalk.cyan(symbol));
    console.log(chalk.white('Decimals:'), chalk.cyan(decimals.toString()));
    console.log(chalk.white('Total Supply:'), chalk.cyan(ethers.formatUnits(totalSupply, decimals)));
    console.log(chalk.white('Your Balance:'), chalk.cyan(ethers.formatUnits(ownerBalance, decimals)));

    // Save deployment info
    const deploymentInfo = {
      network: config.network.name,
      contractAddress: contractAddress,
      deployerAddress: wallet.address,
      tokenName: name,
      tokenSymbol: symbol,
      totalSupply: totalSupply.toString(),
      decimals: decimals.toString(),
      deploymentTx: contract.deploymentTransaction().hash,
      deploymentBlock: (await contract.deploymentTransaction().wait()).blockNumber,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(
      'deployment-info.json',
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log(chalk.gray('\nDeployment info saved to: deployment-info.json'));

    console.log(chalk.cyan('\n' + '='.repeat(60)));
    console.log(chalk.green('✓ Token deployment complete!'));
    console.log(chalk.cyan('='.repeat(60)));
    console.log(chalk.yellow('\nTest your token with the wallet CLI:'));
    console.log(chalk.white(`npm start balance ${wallet.address} --token ${contractAddress}`));
    console.log(chalk.cyan('='.repeat(60) + '\n'));

  } catch (error) {
    console.error(chalk.red('\nDeployment failed:', error.message));
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log(chalk.yellow('Please get more testnet ETH from a faucet'));
    }
    process.exit(1);
  }
}

deployToken();
