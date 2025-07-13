const { Keypair } = require("@solana/web3.js");
const nacl = require("tweetnacl");
const bs58 = require("bs58");
const axios = require("axios");
const fs = require("fs");
const readline = require("readline");
const { HttpsProxyAgent } = require("https-proxy-agent");
const cliProgress = require("cli-progress");

// === Utility Logging ===
function getTimestamp() {
  return new Date().toISOString().replace('T', ' ').replace(/\..+/, '');
}

function log(message) {
  console.log(`[${getTimestamp()}] ${message}`);
}

function error(message) {
  console.error(`[${getTimestamp()}] [ERROR] ${message}`);
}

function info(message) {
  console.log(`[${getTimestamp()}] [INFO] ${message}`);
}

// === CLI Input ===
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
async function getInput(prompt) {
  return new Promise(resolve => rl.question(`[INPUT] ${prompt}`, resolve));
}

// === Load Proxy List ===
const proxyList = fs.readFileSync("proxy.txt", "utf8").split("\n").map(p => p.trim()).filter(p => p);
function getRandomProxy() {
  return proxyList[Math.floor(Math.random() * proxyList.length)];
}

// === Main ===
(async () => {
  info("Script initialized\n");
  const referralCode = await getInput("Enter referral code: ");
  let referralCount = await getInput("Number of referrals (max 50): ");
  referralCount = Math.min(Math.max(parseInt(referralCount), 1), 50);
  rl.close();

  const bar = new cliProgress.SingleBar({
    format: '[PROGRESS] {bar} {percentage}% | Wallet {value}/{total}',
    barCompleteChar: '#',
    barIncompleteChar: '-',
    hideCursor: true
  }, cliProgress.Presets.shades_classic);

  bar.start(referralCount, 0);

  async function getIP(proxy) {
    try {
      const agent = new HttpsProxyAgent(proxy);
      const response = await axios.get("https://api.ipify.org?format=json", { httpsAgent: agent });
      info(`Proxy IP: ${response.data.ip}`);
    } catch (err) {
      error(`Proxy IP failed: ${err.message}`);
    }
  }

  async function requestChallenge(publicKey, agent) {
    try {
      const response = await axios.post("https://prod-api.haio.fun/api/auth/request-challenge", { publicKey }, { httpsAgent: agent });
      return response.data.success ? response.data.content.message : null;
    } catch (err) {
      error(`Challenge failed: ${err.response?.data || err.message}`);
      return null;
    }
  }

  function signMessage(message, secretKey) {
    try {
      const messageUint8 = new TextEncoder().encode(message);
      const signature = nacl.sign.detached(messageUint8, secretKey);
      return bs58.encode(signature);
    } catch (err) {
      error(`Sign failed: ${err.message}`);
      return null;
    }
  }

  async function verifyLogin(publicKey, secretKey, challengeMessage, agent) {
    const signature = signMessage(challengeMessage, secretKey);
    if (!signature) return null;
    try {
      const response = await axios.post("https://prod-api.haio.fun/api/auth/verify", { publicKey, signature }, { httpsAgent: agent });
      return response.data.success ? response.data.content.accessToken : null;
    } catch (err) {
      error(`Verify failed: ${err.response?.data || err.message}`);
      return null;
    }
  }

  async function useReferral(token, agent) {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const response = await axios.post("https://login-er46geo74a-uc.a.run.app/", { referralCode }, { headers: { Authorization: `Bearer ${token}` }, httpsAgent: agent });
      info(response.data.success ? "Referral success." : "Referral failed.");
    } catch (err) {
      error(`Referral error: ${err.response?.data || err.message}`);
    }
  }

  async function claimReward(token, agent) {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const response = await axios.post("https://claimscratchboxcoupon-er46geo74a-uc.a.run.app/", {}, { headers: { Authorization: `Bearer ${token}` }, httpsAgent: agent });
      info(response.data.success ? "Reward claimed." : "Reward failed.");
    } catch (err) {
      error(`Reward error: ${err.response?.data || err.message}`);
    }
  }

  for (let i = 0; i < referralCount; i++) {
    log(`[WALLET ${i + 1}] Creating wallet...`);
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    const fullSecretKey = bs58.encode(keypair.secretKey);
    const maskedSecretKey = fullSecretKey.slice(0, 6) + "..." + fullSecretKey.slice(-6);

    info("Wallet created");
    log(`[KEY] Public Key: ${publicKey}`);
    log(`[KEY] Secret Key: ${maskedSecretKey}`);

    const proxy = getRandomProxy();
    log(`[PROXY] Using: ${proxy}`);
    await getIP(proxy);

    const challengeMessage = await requestChallenge(publicKey, new HttpsProxyAgent(proxy));
    if (!challengeMessage) {
      bar.increment();
      continue;
    }

    const token = await verifyLogin(publicKey, keypair.secretKey, challengeMessage, new HttpsProxyAgent(proxy));
    if (!token) {
      bar.increment();
      continue;
    }

    info("Using referral...");
    await useReferral(token, new HttpsProxyAgent(proxy));
    info("Claiming reward...");
    await claimReward(token, new HttpsProxyAgent(proxy));

    bar.increment();
  }

  bar.stop();
  info("All wallets processed.\n");
})();
