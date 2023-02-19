import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  CommandInteraction,
  VoiceChannel,
  InteractionEditReplyOptions,
  MessagePayload,
  ActionRowData,
  MessageActionRowComponentBuilder,
  MessageActionRowComponentData,
} from "discord.js"
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  VoiceConnection,
} from "@discordjs/voice"

type Status = "waiting" | "running" | "paused" | "stopped" | "finished"

class Pomodoro {
  private id: string
  private interaction: CommandInteraction
  private status: Status = "waiting"
  private connection: VoiceConnection
  private channel: VoiceChannel

  private description: string
  private workDuration: number
  private pauseDuration: number
  private longPauseDuration: number
  private nbSession: number
  private timer: NodeJS.Timeout | null = null
  private isInBreak = false
  private currentSession = 1
  private currentTimer = 0

  constructor(
    ID: string,
    interaction: CommandInteraction,
    channel: VoiceChannel,
    description: string,
    workDuration: number,
    pauseDuration: number,
    longPauseDuration: number,
    nbSession: number,
  ) {
    this.id = ID
    this.interaction = interaction
    this.channel = channel

    this.description = description
    this.workDuration = workDuration
    this.pauseDuration = pauseDuration
    this.longPauseDuration = longPauseDuration
    this.nbSession = nbSession

    this.connection = this.connectToChannel()
  }

  get isStarted() {
    return this.status !== "waiting"
  }

  get isStopped() {
    return this.status === "stopped"
  }

  get isPaused() {
    return this.status === "paused"
  }

  get isRunning() {
    return this.status === "running"
  }

  get isFinished() {
    return this.status === "finished"
  }

  connectToChannel() {
    return joinVoiceChannel({
      channelId: this.channel.id,
      guildId: this.channel.guildId,
      adapterCreator: this.channel.guild.voiceAdapterCreator,
    })
  }

  triggerSound() {
    const pingSound = createAudioResource(
      __dirname + "/../../../assets/ping.mp3",
    )
    const audioPlayer = createAudioPlayer()
    audioPlayer.play(pingSound)
    const subscription = this.connection.subscribe(audioPlayer)

    audioPlayer.on("stateChange", (oldState, newState) => {
      if (newState.status === "idle") {
        subscription?.unsubscribe()
      }
    })
  }

  currentTimerFormatted() {
    if (!this.isStarted || this.isFinished) return "--:--"
    return `${Math.floor(this.currentTimer / 60)}:${
      this.currentTimer % 60 < 10 ? "0" : ""
    }${this.currentTimer % 60}`
  }

  currentSessionFormatted() {
    return `${this.currentSession}/${this.nbSession}`
  }

  buttons() {
    const buttons = []

    if (!this.isStarted) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`pomodoro__${this.id}__start`)
          .setLabel("🚀 Commencer")
          .setStyle(ButtonStyle.Success),
      )
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`pomodoro__${this.id}__cancel`)
          .setLabel("Annuler")
          .setStyle(ButtonStyle.Danger),
      )
    } else if (this.isRunning) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`pomodoro__${this.id}__pause`)
          .setLabel("Pause")
          .setStyle(ButtonStyle.Primary),
      )
    } else if (this.isPaused) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`pomodoro__${this.id}__resume`)
          .setLabel("Reprendre")
          .setStyle(ButtonStyle.Success),
      )
    }

    if (this.isStarted && !this.isFinished) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`pomodoro__${this.id}__stop`)
          .setLabel("Stop")
          .setStyle(ButtonStyle.Danger),
      )
    } else if (this.isFinished) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`pomodoro__${this.id}__restart`)
          .setLabel("Recommencer")
          .setStyle(ButtonStyle.Primary),
      )
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`pomodoro__${this.id}__stop`)
          .setLabel("Arrêter")
          .setStyle(ButtonStyle.Danger),
      )
    }

    return buttons
  }

  embed() {
    const showedStatus =
      this.status === "waiting"
        ? "Pas encore commencé"
        : this.status === "finished"
        ? "Fini 🎉"
        : this.isInBreak
        ? "Pause"
        : "Travail"

    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Pomodoro Timer !")
      .setDescription(this.description)
      .setAuthor({
        name: "Pomodoroo",
        iconURL:
          "https://www.publicbooks.org/wp-content/uploads/2017/01/book-e1484158615982.jpg",
        url: "https://github.com/Maxentr",
      })
      .addFields(
        {
          name: "\u200b",
          value: "\u200b",
          inline: false,
        },
        {
          name: "Session",
          value: this.currentSessionFormatted(),
          inline: true,
        },
        {
          name: "Statut",
          value: showedStatus,
          inline: true,
        },
        {
          name: "Temps restant",
          value: this.currentTimerFormatted(),
          inline: true,
        },
      )
  }

  async render() {
    const updatedEmbed = this.embed()
    const buttons = this.buttons()

    const reply: string | MessagePayload | InteractionEditReplyOptions = {
      content: "",
      embeds: [updatedEmbed],
    }

    if (buttons.length)
      reply.components = [
        new ActionRowBuilder().addComponents(
          ...buttons,
        ) as unknown as ActionRowData<
          MessageActionRowComponentBuilder | MessageActionRowComponentData
        >,
      ]
    else reply.components = []

    await this.interaction.editReply(reply)
  }

  createInterval() {
    return setInterval(() => {
      this.currentTimer--

      if (this.currentTimer < 0 && this.isInBreak) {
        this.triggerSound()

        this.isInBreak = false
        this.currentTimer = this.workDuration
        this.currentSession++
      } else if (this.currentTimer < 0) {
        if (this.currentSession + 1 > this.nbSession) {
          this.end()
          return
        }
        this.triggerSound()

        this.isInBreak = true

        if (this.currentSession % 4 === 0) {
          this.currentTimer = this.longPauseDuration
        } else {
          this.currentTimer = this.pauseDuration
        }
      }

      this.render()
    }, 1000)
  }

  firstDisplay() {
    const embed = this.embed()
    const buttons = this.buttons()

    this.interaction.reply({
      content: "",
      embeds: [embed],
      components: [
        new ActionRowBuilder().addComponents(
          ...buttons,
        ) as unknown as ActionRowData<
          MessageActionRowComponentBuilder | MessageActionRowComponentData
        >,
      ],
    })
  }

  async start() {
    this.status = "running"
    this.currentSession = 1
    this.currentTimer = this.workDuration
    await this.render()
    this.timer = this.createInterval()
  }

  async pause() {
    this.timer && clearInterval(this.timer)
    this.status = "paused"
    await this.render()
  }

  async resume() {
    this.status = "running"
    await this.render()
    this.timer = this.createInterval()
  }

  async stop() {
    this.timer && clearInterval(this.timer)
    this.status = "stopped"
    this.connection.disconnect()
    await this.interaction.deleteReply()
  }

  async restart() {
    this.connection = this.connectToChannel()

    this.status = "running"
    this.currentSession = 1
    this.currentTimer = this.workDuration
    await this.render()
    this.timer = this.createInterval()
  }

  async end() {
    const pingSound = createAudioResource(
      __dirname + "/../../../assets/ping.mp3",
    )
    const audioPlayer = createAudioPlayer()
    audioPlayer.play(pingSound)
    const subscription = this.connection.subscribe(audioPlayer)

    audioPlayer.on("stateChange", (oldState, newState) => {
      if (newState.status === "idle") {
        subscription?.unsubscribe()
        this.connection.disconnect()
      }
    })

    this.timer && clearInterval(this.timer)
    this.status = "finished"
    await this.render()
  }
}

export default Pomodoro
