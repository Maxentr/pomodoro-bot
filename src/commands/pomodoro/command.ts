import { GuildMember, SlashCommandBuilder, VoiceChannel } from "discord.js"
import Pomodoro from "../../commands/pomodoro/class"
import { v4 as uuidv4 } from "uuid"
import POMODORO_MAP from "../../db/db"
import { CommandInt } from "../../types/CommandInt"

type PomodoroTimer = {
  name: string
  tag: string
  value: string
  workDuration: number
  pauseDuration: number
  longPauseDuration: number
}

const PomodoroTimers: PomodoroTimer[] = [
  // {
  //   name: "25 minutes de travail, 5 minutes de pause et 15 minutes pour les longues pauses",
  //   tag: "25/5/15",
  //   value: "25/5/15",
  //   workDuration: 25 * 60,
  //   pauseDuration: 5 * 60,
  //   longPauseDuration: 15 * 60,
  // },
  {
    name: "25 minutes de travail, 5 minutes de pause et 15 minutes pour les longues pauses",
    tag: "25/5/15",
    value: "25/5/15",
    workDuration: 10,
    pauseDuration: 5,
    longPauseDuration: 15,
  },
  {
    name: "50 minutes de travail, 10 minutes de pause et 30 minutes pour les longues pauses",
    tag: "50/10/30",
    value: "50/10/30",
    workDuration: 50 * 60,
    pauseDuration: 10 * 60,
    longPauseDuration: 30 * 60,
  },
]
// Slash command

const PomodoroCommands: CommandInt = {
  data: new SlashCommandBuilder()
    .setName("pomodoro")
    .setDescription(
      "Lance un pomodoro avec le temps et le nombre de pomodoro voulu",
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription(
          "Type de pomodoro -> travail/pause/longue pause (en minutes).",
        )
        .addChoices(
          ...PomodoroTimers.map((timer) => {
            return { name: timer.tag, value: timer.value }
          }),
        )
        .setRequired(true),
    )
    .addNumberOption((option) =>
      option
        .setName("session")
        .setDescription("Le nombre de session")
        .setMinValue(1)
        .setMaxValue(30)
        .setRequired(true),
    ) as SlashCommandBuilder,

  // Command execution
  run: async (interaction) => {
    const member = interaction.member as GuildMember
    const voiceChannel = member.voice.channel as VoiceChannel

    if (voiceChannel) {
      const timer = interaction.options.get("type")?.value as string
      const nbSession = interaction.options.get("session")?.value as number

      const pomodoro = PomodoroTimers.find(
        (pomodoro) => pomodoro.value === timer,
      ) as PomodoroTimer

      const pomodoroID = uuidv4()
      const panel = new Pomodoro(
        pomodoroID,
        interaction,
        voiceChannel,
        pomodoro.name,
        pomodoro.workDuration,
        pomodoro.pauseDuration,
        pomodoro.longPauseDuration,
        nbSession,
      )

      panel.firstDisplay()
      POMODORO_MAP.set(pomodoroID, panel)
    } else {
      await interaction.reply({
        content: `Tu dois être connecté à un salon vocal pour pouvoir utiliser cette commande !`,
        ephemeral: true,
      })

      // wait 5 seconds and delete the reply
      await new Promise((resolve) => setTimeout(resolve, 5000))

      await interaction.deleteReply()
    }
  },
}

export default PomodoroCommands
