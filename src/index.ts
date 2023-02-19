import { Client } from "discord.js"
import { onReady } from "./events/onReady"
import { onInteraction } from "./events/onInteraction"
import { validateEnv } from "./utils/validateEnv"
import { IntentOptions } from "./config/IntentOptions"
import dotenv from "dotenv"

dotenv.config()

//
;(async () => {
  validateEnv()

  const BOT = new Client({ intents: IntentOptions })

  BOT.on("ready", async () => await onReady(BOT))

  BOT.on(
    "interactionCreate",
    async (interaction) => await onInteraction(interaction),
  )

  await BOT.login(process.env.DISCORD_TOKEN)
})()
