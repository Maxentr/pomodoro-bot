const { Client, GatewayIntentBits, Events, Collection } = require("discord.js");
const fs = require("node:fs");
const dotenv = require("dotenv");
const path = require("node:path");
const POMODORO_MAP = require("./db");

dotenv.config();

const GREEN_TEXT = "\x1b[32m";
const RESET_COLOR = "\x1b[0m";

// Create a new client instance
const { Guilds, MessageContent, GuildMessages, GuildMembers, GuildVoiceStates } = GatewayIntentBits;

const client = new Client({ intents: [Guilds, GuildVoiceStates] });

// Register commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ("data" in command && "execute" in command) {
    console.info(`[INFO] Registering command: /${command.data.name}`);
    client.commands.set(command.data.name, command);
  } else {
    console.error(
      `${GREEN_TEXT}[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.${RESET_COLOR}`,
    );
  }
}

// Listen for button clicks
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;
  interaction.deferUpdate();

  const [pomodoroID, buttonState] = interaction.customId.split("__");

  const pomodoro = POMODORO_MAP.get(pomodoroID);
  if (!pomodoro) {
    console.log("Pomodoro not found");
    return;
  }

  if (buttonState === "start") {
    pomodoro.start();
  } else if (buttonState === "pause") {
    pomodoro.pause();
  } else if (buttonState === "resume") {
    pomodoro.resume();
  } else if (buttonState === "stop") {
    pomodoro.stop();
  } else if (buttonState === "cancel") {
    pomodoro.stop();
  }
});

// Listen for input commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.login(process.env.DISCORD_TOKEN);

client.once(Events.ClientReady, (c) => {
  console.log(`${GREEN_TEXT}Ready! Logged in as ${c.user.tag}${RESET_COLOR}`);
});
