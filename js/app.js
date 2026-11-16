(function () {
  var CHAINS = {
    robinhood: {
      id: 4663,
      hex: "0x1237",
      name: "Robinhood Chain",
      rpc: "https://rpc.mainnet.chain.robinhood.com",
      symbol: "ETH",
      explorer: "https://robinhoodchain.blockscout.com"
    },
    base: {
      id: 8453,
      hex: "0x2105",
      name: "Base",
      rpc: "https://mainnet.base.org",
      symbol: "ETH",
      explorer: "https://basescan.org"
    },
    arbitrum: {
      id: 42161,
      hex: "0xa4b1",
      name: "Arbitrum",
      rpc: "https://arb1.arbitrum.io/rpc",
      symbol: "ETH",
      explorer: "https://arbiscan.io"
    },
    bnb: {
      id: 56,
      hex: "0x38",
      name: "BNB Chain",
      rpc: "https://bsc-dataseed.binance.org",
      symbol: "BNB",
      explorer: "https://bscscan.com"
    }
  };

  var TABS = {
    getaway: {
      note: "Private send. The Driver would post it. That action is not open yet.",
      ready: "Private send launching soon",
      network: "Network"
    },
    switch: {
      note: "Swap inside the vault, between ETH, USDC, and USDG. Not open yet.",
      ready: "Switch launching soon",
      network: "Network"
    },
    escape: {
      note: "Private bridge onto the network you pick. Not open yet.",
      ready: "Escape launching soon",
      network: "Destination network"
    }
  };

  var tab = "getaway";
  var asset = "ETH";
  var into = "USDC";
  var account = "";
  var nativeBalance = null;
  var provider = window.ethereum || null;

  var note = document.getElementById("tab-note");
  var connectBtn = document.getElementById("connect");
  var meta = document.getElementById("wallet-meta");
  var addrEl = document.getElementById("wallet-addr");
  var balEl = document.getElementById("wallet-bal");
  var fallback = document.getElementById("wallet-fallback");
  var statusEl = document.getElementById("wallet-status");
  var amount = document.getElementById("amount");
  var maxBtn = document.getElementById("max");
  var balNote = document.getElementById("bal-note");
  var recipientField = document.getElementById("recipient-field");
  var recipient = document.getElementById("recipient");
  var switchTo = document.getElementById("switch-to");
  var network = document.getElementById("network");
  var networkLabel = document.getElementById("network-label");
  var go = document.getElementById("go");

  function chain() {
    return CHAINS[network.value] || CHAINS.base;
  }

  function setStatus(text) {
    statusEl.textContent = text || "";
  }

  function shortAddr(value) {
    if (!value || value.length < 10) return value || "";
    return value.slice(0, 6) + "…" + value.slice(-4);
  }

  function formatWei(hex) {
    var wei = BigInt(hex);
    var base = 10n ** 18n;
    var whole = wei / base;
    var frac = (wei % base).toString().padStart(18, "0").slice(0, 6).replace(/0+$/, "");
    return frac ? whole.toString() + "." + frac : whole.toString();
  }

  function rpc(target, method, params) {
    return fetch(target.rpc, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: method, params: params })
    }).then(function (res) {
      if (!res.ok) throw new Error("The chain did not answer.");
      return res.json();
    }).then(function (json) {
      if (!json || json.error) throw new Error((json && json.error && json.error.message) || "The chain did not answer.");
      return json.result;
    });
  }

  function nativeSelected() {
    return asset === chain().symbol;
  }

  function paintBalance() {
    var current = chain();
    if (!account) {
      meta.hidden = true;
      balEl.textContent = "";
      addrEl.textContent = "";
      balNote.textContent = "Connect a wallet to read a native balance from the chain.";
      maxBtn.disabled = true;
      nativeBalance = null;
      return;
    }
    meta.hidden = false;
    addrEl.textContent = shortAddr(account);
    if (nativeBalance == null) {
      balEl.textContent = "Reading " + current.name + "…";
      balNote.textContent = "Reading the native balance from " + current.name + ".";
      maxBtn.disabled = true;
      return;
    }
    balEl.textContent = nativeBalance + " " + current.symbol;
    if (nativeSelected()) {
      balNote.textContent = "Native balance on " + current.name + ". MAX fills the full balance, not a guessed amount.";
      maxBtn.disabled = false;
    } else {
      balNote.textContent = "No balance to read for " + asset + ". Vault contracts are not deployed, so this desk only reads the native " + current.symbol + " balance.";
      maxBtn.disabled = true;
    }
  }

  function refreshBalance() {
    nativeBalance = null;
    paintBalance();
    if (!account) return;
    var current = chain();
    var requested = account;
    rpc(current, "eth_getBalance", [requested, "latest"]).then(function (hex) {
      if (account !== requested || chain().id !== current.id) return;
      nativeBalance = formatWei(hex);
      paintBalance();
    }).catch(function () {
      if (account !== requested) return;
      nativeBalance = null;
      balEl.textContent = "Balance unread";
      balNote.textContent = "Could not read the native balance from " + current.name + ".";
      maxBtn.disabled = true;
    });
  }

  function validAmount() {
    var value = amount.value.trim();
    if (!/^\d+(\.\d+)?$/.test(value)) return false;
    var n = Number(value);
    return isFinite(n) && n > 0;
  }

  function validAddress() {
    return /^0x[a-fA-F0-9]{40}$/.test(recipient.value.trim());
  }

  function formReady() {
    if (!account || !validAmount()) return false;
    if (tab === "switch") return into !== asset;
    return validAddress();
  }

  function paintAction() {
    go.disabled = true;
    go.textContent = formReady() ? TABS[tab].ready : "Enter the details";
  }

  function showTab(next) {
    tab = next;
    document.querySelectorAll(".app-tabs button").forEach(function (button) {
      var on = button.getAttribute("data-tab") === next;
      button.setAttribute("aria-selected", on ? "true" : "false");
    });
    note.textContent = TABS[next].note;
    networkLabel.textContent = TABS[next].network;
    var isSwitch = next === "switch";
    switchTo.hidden = !isSwitch;
    recipientField.hidden = isSwitch;
    paintAction();
  }

  function setAsset(next) {
    asset = next;
    document.querySelectorAll("[data-asset]").forEach(function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-asset") === next ? "true" : "false");
    });
    if (into === asset) {
      into = asset === "USDC" ? "ETH" : "USDC";
      document.querySelectorAll("[data-into]").forEach(function (button) {
        button.setAttribute("aria-pressed", button.getAttribute("data-into") === into ? "true" : "false");
      });
    }
    paintBalance();
    paintAction();
  }

  function ensureChain() {
    if (!provider || !account) return Promise.resolve();
    var current = chain();
    return provider.request({ method: "eth_chainId" }).then(function (hex) {
      if (parseInt(hex, 16) === current.id) return null;
      return provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: current.hex }]
      }).catch(function (error) {
        if (!error || error.code !== 4902) throw error;
        return provider.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: current.hex,
            chainName: current.name,
            nativeCurrency: { name: current.symbol, symbol: current.symbol, decimals: 18 },
            rpcUrls: [current.rpc],
            blockExplorerUrls: [current.explorer]
          }]
        });
      });
    }).then(function () {
      setStatus("");
    }).catch(function (error) {
      var message = error && error.message ? error.message : "The wallet did not switch networks.";
      setStatus(message);
    });
  }

  function connect() {
    if (!provider) {
      fallback.hidden = false;
      return;
    }
    fallback.hidden = true;
    setStatus("");
    provider.request({ method: "eth_requestAccounts" }).then(function (accounts) {
      account = accounts && accounts[0] ? accounts[0] : "";
      connectBtn.textContent = account ? "Connected" : "Connect wallet";
      return ensureChain();
    }).then(function () {
      refreshBalance();
      paintAction();
    }).catch(function (error) {
      var message = error && error.message ? error.message : "The wallet rejected the request.";
      setStatus(message);
    });
  }

  if (!provider) fallback.hidden = false;

  document.querySelectorAll(".app-tabs button").forEach(function (button) {
    button.addEventListener("click", function () {
      showTab(button.getAttribute("data-tab"));
    });
  });

  document.querySelectorAll("[data-asset]").forEach(function (button) {
    button.addEventListener("click", function () {
      setAsset(button.getAttribute("data-asset"));
    });
  });

  document.querySelectorAll("[data-into]").forEach(function (button) {
    button.addEventListener("click", function () {
      into = button.getAttribute("data-into");
      document.querySelectorAll("[data-into]").forEach(function (item) {
        item.setAttribute("aria-pressed", item === button ? "true" : "false");
      });
      if (into === asset) setAsset(asset === "ETH" ? "USDC" : "ETH");
      else paintAction();
    });
  });

  amount.addEventListener("input", paintAction);
  recipient.addEventListener("input", paintAction);

  maxBtn.addEventListener("click", function () {
    if (!nativeSelected() || nativeBalance == null) return;
    amount.value = nativeBalance;
    paintAction();
  });

  network.addEventListener("change", function () {
    nativeBalance = null;
    paintBalance();
    if (account) {
      ensureChain().then(refreshBalance);
    }
    paintAction();
  });

  connectBtn.addEventListener("click", connect);

  if (provider) {
    provider.on && provider.on("accountsChanged", function (accounts) {
      account = accounts && accounts[0] ? accounts[0] : "";
      connectBtn.textContent = account ? "Connected" : "Connect wallet";
      refreshBalance();
      paintAction();
    });
    provider.on && provider.on("chainChanged", function () {
      refreshBalance();
    });
  }

  showTab("getaway");
  paintBalance();
  paintAction();
})();
