#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const config = require('./config');
const {
  createWalletInteractive,
  importWalletInteractive,
  listWallets,
  loadWallet
} = require('./wallet');
const { checkBalance } = require('./balance');
const { sendEth, sendToken } = require('./transaction');
const { displayTransactionHistory } = require('./history');

const program = new Command();

// Program info
program
  .name('token-wallet')
  .description('A simple Ethereum token wallet CLI for beginners')
  .version('1.0.0');

// Wallet commands
const walletCmd = program.command('wallet').description('Wallet management commands');

walletCmd
  .command('create')
  .description('Create a new wallet')
  .action(async () => {
    try {
      await createWalletInteractive();
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

walletCmd
  .command('import')
  .description('Import wallet from private key or mnemonic')
  .action(async () => {
    try {
      await importWalletInteractive();
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

walletCmd
  .command('list')
  .description('List all saved wallets')
  .action(() => {
    try {
      const wallets = listWallets();

      if (wallets.length === 0) {
        console.log(chalk.yellow('\nNo saved wallets found.'));
        console.log(chalk.gray('Create a new wallet with: token-wallet wallet create'));
        return;
      }

      console.log(chalk.blue(`\nFound ${wallets.length} saved wallet(s):\n`));

      wallets.forEach((wallet, index) => {
        console.log(chalk.white(`${index + 1}. ${wallet.name}`));
        console.log(chalk.gray(`   Address:    ${wallet.address}`));
        console.log(chalk.gray(`   Created:    ${new Date(wallet.createdAt).toLocaleString()}\n`));
      });
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Balance command
program
  .command('balance')
  .description('Check balance for an address')
  .argument('<address>', 'Ethereum address to check')
  .option('-t, --token <address>', 'ERC-20 token contract address')
  .action(async (address, options) => {
    try {
      await checkBalance(address, options.token);
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Send command
program
  .command('send')
  .description('Send ETH or tokens')
  .argument('<to>', 'Recipient address')
  .argument('<amount>', 'Amount to send')
  .option('-t, --token <address>', 'ERC-20 token contract address (omit for ETH)')
  .action(async (to, amount, options) => {
    try {
      // List saved wallets
      const wallets = listWallets();

      if (wallets.length === 0) {
        console.log(chalk.yellow('\nNo saved wallets found.'));
        console.log(chalk.gray('Create a new wallet with: token-wallet wallet create'));
        console.log(chalk.gray('Or import an existing wallet with: token-wallet wallet import'));
        return;
      }

      // Prompt user to select wallet
      const { selectedWallet } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedWallet',
          message: 'Select wallet to send from:',
          choices: wallets.map(w => ({
            name: `${w.name} (${w.address})`,
            value: w.name
          }))
        }
      ]);

      // Prompt for password
      const { password } = await inquirer.prompt([
        {
          type: 'password',
          name: 'password',
          message: 'Enter wallet password:',
          validate: input => input.length > 0 || 'Password is required'
        }
      ]);

      // Load wallet
      const wallet = await loadWallet(selectedWallet, password);

      // Send transaction
      if (options.token) {
        await sendToken(wallet, to, amount, options.token);
      } else {
        await sendEth(wallet, to, amount);
      }
    } catch (error) {
      console.error(chalk.red(`\nError: ${error.message}`));
      process.exit(1);
    }
  });

// History command
program
  .command('history')
  .description('View transaction history')
  .argument('<address>', 'Ethereum address')
  .option('-l, --limit <number>', 'Number of transactions to fetch', '10')
  .option('-t, --token <address>', 'Filter by ERC-20 token contract address')
  .action(async (address, options) => {
    try {
      await displayTransactionHistory(address, {
        limit: parseInt(options.limit),
        token: options.token
      });
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Info command
program
  .command('info')
  .description('Display network and configuration info')
  .action(() => {
    console.log(chalk.blue('\nToken Wallet Configuration:\n'));
    console.log(chalk.white('Network:'), chalk.cyan(config.network.name));
    console.log(chalk.white('Chain ID:'), chalk.cyan(config.network.chainId));
    console.log(chalk.white('RPC URL:'), chalk.cyan(config.network.rpcUrl));
    console.log(chalk.white('Explorer:'), chalk.cyan(config.network.explorerUrl));
    console.log(chalk.white('Currency:'), chalk.cyan(config.network.currency));
    console.log(chalk.white('Wallets Directory:'), chalk.cyan(config.walletsDir));

    if (config.etherscanApiKey) {
      console.log(chalk.white('Etherscan API:'), chalk.green('Configured ✓'));
    } else {
      console.log(chalk.white('Etherscan API:'), chalk.yellow('Not configured (history feature limited)'));
    }

    console.log(chalk.gray('\nTo change network, edit your .env file'));
  });

// Display header on every command
program.hook('preAction', () => {
  console.log(chalk.bold.cyan('\n╔══════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║       Ethereum Token Wallet          ║'));
  console.log(chalk.bold.cyan('╚══════════════════════════════════════╝'));
});

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
