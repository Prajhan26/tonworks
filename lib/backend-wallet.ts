import { Address, SendMode, internal, toNano } from "@ton/core";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { TonClient, WalletContractV4 } from "@ton/ton";

const TESTNET_ENDPOINT = "https://testnet.toncenter.com/api/v2/jsonRPC";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

export function getBackendWalletAddress() {
  return Address.parse(requireEnv("BACKEND_WALLET_ADDRESS"));
}

export async function sendBackendPayout(params: {
  amountTon: number;
  workerWallet: string;
}) {
  const mnemonic = requireEnv("TON_WALLET_MNEMONIC");
  const backendWalletAddress = getBackendWalletAddress();
  const keyPair = await mnemonicToPrivateKey(mnemonic.split(" "));

  const client = new TonClient({
    endpoint: TESTNET_ENDPOINT,
  });

  const walletContract = WalletContractV4.create({
    workchain: 0,
    publicKey: keyPair.publicKey,
  });

  if (!walletContract.address.equals(backendWalletAddress)) {
    throw new Error("BACKEND_WALLET_ADDRESS does not match the mnemonic-derived wallet.");
  }

  const provider = client.provider(walletContract.address);
  const seqno = await walletContract.getSeqno(provider);

  await walletContract.sendTransfer(provider, {
    seqno,
    secretKey: keyPair.secretKey,
    sendMode: SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS,
    messages: [
      internal({
        to: Address.parse(params.workerWallet),
        value: toNano(params.amountTon.toString()),
        bounce: false,
      }),
    ],
  });

  return {
    backendWalletAddress: backendWalletAddress.toString(),
  };
}
