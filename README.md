Haio Referral Automation Bot

Automated referral bot for platforms using Solana wallet authentication — built for testing and research purposes. This script programmatically generates wallets, signs authentication challenges, applies referral codes, and claims rewards while rotating through HTTP proxies to simulate real users.

---

## 🔍 Purpose

**Haio-Bot** automates the referral and reward-claim process on platforms like [haio.fun](https://haio.fun) that authenticate users via Solana public/private keys. It can simulate dozens of referral events from different IP addresses, ideal for testing APIs, simulating user activity, or studying the mechanics of decentralized login systems.

> ⚠️ This tool is for **educational and ethical testing purposes only**. Misusing it to exploit referral systems may violate terms of service or legal regulations.

---

## ✨ Features

- ✅ Generate up to 50 Solana wallets automatically
- ✅ Sign login/authentication challenges securely (Ed25519)
- ✅ Handle full challenge–signature–verification login flow
- ✅ Use random HTTP/S proxies to spoof user IPs
- ✅ Submit referral codes and trigger referral success logic
- ✅ Claim rewards from the backend after registration
- ✅ Simple CLI interface with timestamped logs and progress bar
- ✅ Obfuscates secret keys in logs for safety

---

### ✅ Requirements

- **Node.js**: version **16.x or later**
- **npm**: version **8.x or later**
- A stable internet connection
- Proxy access (optional but recommended)

---

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/Haio-Bot.git
cd Haio-Bot
