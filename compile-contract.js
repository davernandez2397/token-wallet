const solc = require('solc');
const fs = require('fs');
const path = require('path');

// Read the contract source code
const contractPath = path.join(__dirname, 'contracts', 'MyToken.sol');
const source = fs.readFileSync(contractPath, 'utf8');

// Prepare the input for the Solidity compiler
const input = {
  language: 'Solidity',
  sources: {
    'MyToken.sol': {
      content: source
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode']
      }
    }
  }
};

// Compile the contract
console.log('Compiling MyToken.sol...\n');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Check for errors
if (output.errors) {
  const errors = output.errors.filter(error => error.severity === 'error');
  if (errors.length > 0) {
    console.error('Compilation errors:');
    errors.forEach(error => console.error(error.formattedMessage));
    process.exit(1);
  }

  // Show warnings
  const warnings = output.errors.filter(error => error.severity === 'warning');
  if (warnings.length > 0) {
    console.log('Warnings:');
    warnings.forEach(warning => console.log(warning.formattedMessage));
  }
}

// Extract the contract
const contract = output.contracts['MyToken.sol']['MyToken'];

// Save ABI and bytecode to files
const artifactsDir = path.join(__dirname, 'artifacts');
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir);
}

const artifact = {
  abi: contract.abi,
  bytecode: contract.evm.bytecode.object
};

fs.writeFileSync(
  path.join(artifactsDir, 'MyToken.json'),
  JSON.stringify(artifact, null, 2)
);

console.log('✓ Contract compiled successfully!');
console.log(`✓ ABI and bytecode saved to: artifacts/MyToken.json`);
console.log(`\nContract info:`);
console.log(`  Functions: ${contract.abi.filter(item => item.type === 'function').length}`);
console.log(`  Events: ${contract.abi.filter(item => item.type === 'event').length}`);
console.log(`  Bytecode size: ${contract.evm.bytecode.object.length / 2} bytes\n`);
