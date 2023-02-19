import { Interaction } from "discord.js"
import { CommandList } from "../commands/_CommandList"

const onInteraction = async (interaction: Interaction): Promise<void> => {
  try {
    if (interaction.isCommand()) {
      for (const { command } of CommandList) {
        if (interaction.commandName === command.data.name) {
          await command.run(interaction)
          break
        }
      }
    } else if (interaction.isButton()) {
      interaction.deferUpdate()

      const [commandName, ID, buttonState] = interaction.customId.split("__")

      for (const { command, buttonInteractionHandler } of CommandList) {
        if (commandName === command.data.name) {
          await buttonInteractionHandler(interaction, ID, buttonState)
          break
        }
      }
    }
  } catch (err) {
    console.error("onInteraction event", err)
  }
}

export { onInteraction }
