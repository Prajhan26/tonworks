const { mnemonicNew, mnemonicToPrivateKey } = require("ton-crypto");
const { WalletContractV4 } = require("@ton/ton");

async function main() {
  const mnemonic = await mnemonicNew(24);
  const keyPair = await mnemonicToPrivateKey(mnemonic);

  const wallet = WalletContractV4.create({
    workchain: 0,
    publicKey: keyPair.publicKey,
  });

  const testnetAddress = wallet.address.toString({
    bounceable: false,
    urlSafe: true,
    testOnly: true,
  });

  console.log("Mnemonic:");
  console.log(mnemonic.join(" "));
  console.log("");
  console.log("Testnet wallet address:");
  console.log(testnetAddress);
  console.log("");
  console.log("Use these values for:");
  console.log("- TON_WALLET_MNEMONIC");
  console.log("- BACKEND_WALLET_ADDRESS");
}

main().catch((error) => {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
});
