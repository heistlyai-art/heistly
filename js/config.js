/**
 * Heistly public config.
 * contractAddress stays "" until the real Robinhood Chain contract is published.
 * An empty string renders as "Coming soon". Never put a placeholder address here.
 * appUrl "#" keeps calls to action on this site. The app is not open yet.
 */
window.HEISTLY_CONFIG = {
  siteName: "Heistly",
  domain: "heistlyai.com",
  url: "https://heistlyai.com",
  tagline: "The perfect getaway. No trail.",
  xUrl: "https://x.com/heistlyai",
  xHandle: "@heistlyai",
  appUrl: "#",
  token: {
    symbol: "$HEIST",
    chain: "Robinhood Chain",
    contractAddress: "",
  },
};
