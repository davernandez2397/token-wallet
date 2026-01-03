const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const config = require('./config');

// Ensure wallets directory exists
if (!fs.existsSync(config.walletsDir)) {
  fs.mkdirSync(config.walletsDir, { recursive: true });
}

/**
 * Create a new random wallet
 * @returns {Object} - Wallet object with mnemonic and address
 */
async function createWallet() {
  console.log(chalk.blue('\nCreating new wallet...'));

  // Generate random wallet with mnemonic
  const wallet = ethers.Wallet.createRandom();

  console.log(chalk.green('\nWallet created successfully!'));
  console.log(chalk.yellow('\nIMPORTANT: Save your mnemonic phrase securely!'));
  console.log(chalk.yellow('You will need it to recover your wallet.\n'));
  console.log(chalk.white('Mnemonic:'), chalk.cyan(wallet.mnemonic.phrase));
  console.log(chalk.white('Address:'), chalk.cyan(wallet.address));

  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic.phrase
  };
}

/**
 * Import wallet from private key or mnemonic
 * @param {string} input - Private key or mnemonic phrase
 * @returns {Object} - Wallet object
 */
async function importWallet(input) {
  console.log(chalk.blue('\nImporting wallet...'));

  try {
    let wallet;

    // Check if input is a private key (starts with 0x and is 66 chars) or mnemonic
    if (input.startsWith('0x') && input.length === 66) {
      // Import from private key
      wallet = new ethers.Wallet(input);
      console.log(chalk.green('\nWallet imported from private key!'));
    } else {
      // Try to import from mnemonic
      wallet = ethers.Wallet.fromPhrase(input);
      console.log(chalk.green('\nWallet imported from mnemonic!'));
    }

    console.log(chalk.white('Address:'), chalk.cyan(wallet.address));

    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic ? wallet.mnemonic.phrase : null
    };
  } catch (error) {
    throw new Error('Invalid private key or mnemonic phrase');
  }
}

/**
 * Save wallet to encrypted JSON file
 * @param {Object} walletData - Wallet data (address, privateKey, mnemonic)
 * @param {string} name - Wallet name/alias
 * @param {string} password - Encryption password
 */
async function saveWallet(walletData, name, password) {
  console.log(chalk.blue('\nEncrypting and saving wallet...'));

  // Create wallet object from private key
  const wallet = new ethers.Wallet(walletData.privateKey);

  // Encrypt wallet with password
  const encryptedJson = await wallet.encrypt(password);

  // Save to file
  const filename = `${name.toLowerCase().replace(/\s+/g, '-')}.json`;
  const filepath = path.join(config.walletsDir, filename);

  // Create wallet metadata
  const walletFile = {
    name: name,
    address: walletData.address,
    encrypted: encryptedJson,
    createdAt: new Date().toISOString()
  };

  fs.writeFileSync(filepath, JSON.stringify(walletFile, null, 2));
  console.log(chalk.green(`\nWallet saved to: ${filepath}`));
}

/**
 * Load and decrypt wallet from file
 * @param {string} name - Wallet name/alias
 * @param {string} password - Decryption password
 * @returns {ethers.Wallet} - Decrypted wallet instance
 */
async function loadWallet(name, password) {
  const filename = `${name.toLowerCase().replace(/\s+/g, '-')}.json`;
  const filepath = path.join(config.walletsDir, filename);

  if (!fs.existsSync(filepath)) {
    throw new Error(`Wallet "${name}" not found`);
  }

  const walletFile = JSON.parse(fs.readFileSync(filepath, 'utf8'));

  console.log(chalk.blue('\nDecrypting wallet...'));

  try {
    // Decrypt wallet
    const wallet = await ethers.Wallet.fromEncryptedJson(
      walletFile.encrypted,
      password
    );

    console.log(chalk.green('Wallet decrypted successfully!'));
    console.log(chalk.white('Address:'), chalk.cyan(wallet.address));

    return wallet;
  } catch (error) {
    throw new Error('Incorrect password');
  }
}

/**
 * List all saved wallets
 * @returns {Array} - Array of wallet info
 */
function listWallets() {
  if (!fs.existsSync(config.walletsDir)) {
    return [];
  }

  const files = fs.readdirSync(config.walletsDir).filter(f => f.endsWith('.json'));

  return files.map(filename => {
    const filepath = path.join(config.walletsDir, filename);
    const walletFile = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    return {
      name: walletFile.name,
      address: walletFile.address,
      createdAt: walletFile.createdAt
    };
  });
}

/**
 * Interactive wallet creation flow
 */
async function createWalletInteractive() {
  const walletData = await createWallet();

  // Ask if user wants to save the wallet
  const { shouldSave } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shouldSave',
      message: 'Do you want to save this wallet (encrypted)?',
      default: true
    }
  ]);

  if (shouldSave) {
    const { name, password, confirmPassword } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter a name for this wallet:',
        validate: input => input.length > 0 || 'Name is required'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter a password to encrypt the wallet:',
        validate: input => input.length >= 8 || 'Password must be at least 8 characters'
      },
      {
        type: 'password',
        name: 'confirmPassword',
        message: 'Confirm password:',
        validate: (input, answers) => input === answers.password || 'Passwords do not match'
      }
    ]);

    await saveWallet(walletData, name, password);
  } else {
    console.log(chalk.yellow('\nWallet not saved. Make sure to securely store your mnemonic phrase!'));
  }
}

/**
 * Interactive wallet import flow
 */
async function importWalletInteractive() {
  const { input } = await inquirer.prompt([
    {
      type: 'input',
      name: 'input',
      message: 'Enter private key (0x...) or mnemonic phrase:',
      validate: input => input.length > 0 || 'Input is required'
    }
  ]);

  try {
    const walletData = await importWallet(input);

    // Ask if user wants to save the wallet
    const { shouldSave } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldSave',
        message: 'Do you want to save this wallet (encrypted)?',
        default: true
      }
    ]);

    if (shouldSave) {
      const { name, password, confirmPassword } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Enter a name for this wallet:',
          validate: input => input.length > 0 || 'Name is required'
        },
        {
          type: 'password',
          name: 'password',
          message: 'Enter a password to encrypt the wallet:',
          validate: input => input.length >= 8 || 'Password must be at least 8 characters'
        },
        {
          type: 'password',
          name: 'confirmPassword',
          message: 'Confirm password:',
          validate: (input, answers) => input === answers.password || 'Passwords do not match'
        }
      ]);

      await saveWallet(walletData, name, password);
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

module.exports = {
  createWallet,
  importWallet,
  saveWallet,
  loadWallet,
  listWallets,
  createWalletInteractive,
  importWalletInteractive
};
