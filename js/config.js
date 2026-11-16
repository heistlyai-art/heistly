/**
 * Heistly public config.
 * contractAddress stays "" until the real Robinhood Chain contract is published.
 * An empty string renders as "Coming soon". Never put a placeholder address here.
 * githubUrl stays "" to hide the footer GitHub link.
 * appUrl "#" keeps "Assemble your crew" on this site (app coming soon).
 */
window.HEISTLY_CONFIG = {
  siteName: "Heistly",
  domain: "heistlyai.com",
  url: "https://heistlyai.com",
  tagline: "Your crew works the market while you sleep.",
  xUrl: "https://x.com/heistlyai",
  xHandle: "@heistlyai",
  githubUrl: "",
  appUrl: "#",
  token: {
    symbol: "$HEIST",
    chain: "Robinhood Chain",
    contractAddress: "",
  },
};
