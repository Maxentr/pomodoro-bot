import { REST } from "@discordjs/rest"
import { APIApplicationCommandOption, Routes } from "discord-api-types/v9"
import { CommandList } from "../commands/_CommandList"
import { Client } from "discord.js"

const onReady = async (BOT: Client): Promise<void> => {
  try {
    const rest = new REST({ version: "9" }).setToken(
      process.env.DISCORD_TOKEN as string,
    )

    const commandData: {
      name: string
      description?: string
      type?: number
      options?: APIApplicationCommandOption[]
    }[] = []

    CommandList.forEach(({ command }) =>
      commandData.push(
        command.data.toJSON() as {
          name: string
          description?: string
          type?: number
          options?: APIApplicationCommandOption[]
        },
      ),
    )
    await rest.put(
      Routes.applicationGuildCommands(
        BOT.user?.id || "missing token",
        process.env.DISCORD_SERVER_ID as string,
      ),
      { body: commandData },
    )
    console.log("info", "Bot has connected to Discord!")
  } catch (err) {
    console.error("onReady event", err)
  }
}

export { onReady }
