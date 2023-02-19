/* eslint-disable no-unused-vars */

import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders"
import { ButtonInteraction, CommandInteraction } from "discord.js"

type CommandInt = {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder
  run: (interaction: CommandInteraction) => Promise<void>
}

type buttonInteractionHandler = (
  interaction: ButtonInteraction,
  id: string,
  state: string,
) => Promise<void>

type CommandListInt = {
  command: CommandInt
  buttonInteractionHandler: buttonInteractionHandler
}

export { CommandInt, CommandListInt, buttonInteractionHandler }
