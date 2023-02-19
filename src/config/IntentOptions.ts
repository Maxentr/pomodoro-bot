import { BitFieldResolvable, GatewayIntentsString } from "discord.js"

const IntentOptions: BitFieldResolvable<GatewayIntentsString, number> = [
  "Guilds",
  "GuildVoiceStates",
]

export { IntentOptions }
