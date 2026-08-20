import { initBotId } from "botid/client/core";

// BotID (Kasada) covers the browser-impersonating bots that UA filtering in
// proxy.ts can't see. Only fetch()-based dynamic endpoints belong here —
// top-level navigations (e.g. /search) carry no BotID headers, and static
// pages must never gain a per-request check.
initBotId({
  protect: [
    {
      path: "/api/search",
      method: "GET",
    },
  ],
});
