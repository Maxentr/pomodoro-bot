const { SlashCommandBuilder } = require("discord.js");
const Pomodoro = require("../class/Pomodoro");
const { v4: uuidv4 } = require("uuid");
const POMODORO_MAP = require("../db");

const PomodoroTimers = [
  {
    name: "25 minutes de travail, 5 minutes de pause et 15 minutes pour les longues pauses",
    tag: "25/5/15",
    value: "25/5/15",
    work: 25 * 60,
    pause: 5 * 60,
    long_pause: 15 * 60,
  },
  {
    name: "50 minutes de travail, 10 minutes de pause et 30 minutes pour les longues pauses",
    tag: "50/10/30",
    value: "50/10/30",
    work: 50 * 60,
    pause: 10 * 60,
    long_pause: 30 * 60,
  },
];
// Slash command
const data = new SlashCommandBuilder()
  .setName("pomodoro")
  .setDescription("Lance un pomodoro avec le temps et le nombre de pomodoro voulu")
  .addStringOption((option) =>
    option
      .setName("type")
      .setDescription("Type de pomodoro -> travail/pause/longue pause (en minutes).")
      .addChoices(
        ...PomodoroTimers.map((timer) => {
          return { name: timer.tag, value: timer.value };
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
  );

// Command execution
const execute = async (interaction) => {
  const user = await interaction.member.fetch();
  const channel = await user.voice.channel;

  if (channel) {
    const timer = interaction.options.getString("type");
    const nbSession = interaction.options.getNumber("session");
    const pomodoro = PomodoroTimers.find((pomodoro) => pomodoro.value === timer);

    const pomodoroID = uuidv4();
    const panel = new Pomodoro(
      pomodoroID,
      interaction,
      channel,
      pomodoro.name,
      pomodoro.work,
      pomodoro.pause,
      pomodoro.long_pause,
      nbSession,
    );

    panel.firstDisplay();
    POMODORO_MAP.set(pomodoroID, panel);
  } else {
    await interaction.reply({
      content: `Tu dois être connecté à un salon vocal pour pouvoir utiliser cette commande !`,
      ephemeral: true,
    });

    // wait 5 seconds and delete the reply
    await new Promise((resolve) => setTimeout(resolve, 5000));

    await interaction.deleteReply();
  }
};

module.exports = { data, execute };
