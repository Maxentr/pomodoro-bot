const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");

const pingSound = createAudioResource(__dirname + "/../../assets/ping.mp3");

// status = waiting, running, paused, stopped, finished
/**
 * @private @property {string} _id
 * @private @property {string} _userID
 * @private @property {number} _workDuration
 * @private @property {number} _pauseDuration
 * @private @property {number} _longPauseDuration
 * @private @property {number} _nbSession
 * @private @property {NodeJS.Timeout} _timer
 * @private @property {string} _status
 * @private @property {number} _currentSession
 * @private @property {number} _currentTimer
 * @private @property {number} currentSession
 * @private @property {number} currentTimer
 */
class Pomodoro {
  _id = null;
  _interaction = null;
  _status = "waiting";
  _connection = null;

  _description = null;
  _workDuration = null;
  _pauseDuration = null;
  _longPauseDuration = null;
  _nbSession = 0;
  _timer = null;
  _isInBreak = false;
  _currentSession = 1;
  _currentTimer = null;

  constructor(
    ID,
    interaction,
    channel,
    description,
    workDuration,
    pauseDuration,
    longPauseDuration,
    nbSession,
  ) {
    this._id = ID;
    this._interaction = interaction;
    this._channel = channel;
    this._connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guildId,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    this._description = description;
    this._workDuration = workDuration;
    this._pauseDuration = pauseDuration;
    this._longPauseDuration = longPauseDuration;
    this._nbSession = nbSession;
  }

  get isStarted() {
    return this._status !== "waiting";
  }

  get isStopped() {
    return this._status === "stopped";
  }

  get isPaused() {
    return this._status === "paused";
  }

  get isRunning() {
    return this._status === "running";
  }

  get isFinished() {
    return this._status === "finished";
  }

  triggerSound() {
    const audioPlayer = createAudioPlayer();
    audioPlayer.play(pingSound);
    const subscription = this._connection.subscribe(audioPlayer);

    audioPlayer.on("stateChange", (oldState, newState) => {
      if (newState.status === "idle") {
        subscription.unsubscribe();
      }
    });
  }

  currentTimerFormatted() {
    if (!this.isStarted || this.isFinished) return "--:--";
    return `${Math.floor(this._currentTimer / 60)}:${this._currentTimer % 60 < 10 ? "0" : ""}${
      this._currentTimer % 60
    }`;
  }

  currentSessionFormatted() {
    return `${this._currentSession}/${this._nbSession}`;
  }

  buttons() {
    const buttons = [];

    if (!this.isStarted) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`${this._id}__start`)
          .setLabel("🚀 Commencer")
          .setStyle(ButtonStyle.Success),
      );
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`${this._id}__cancel`)
          .setLabel("Annuler")
          .setStyle(ButtonStyle.Danger),
      );
    } else if (this.isRunning) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`${this._id}__pause`)
          .setLabel("Pause")
          .setStyle(ButtonStyle.Primary),
      );
    } else if (this.isPaused) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`${this._id}__resume`)
          .setLabel("Reprendre")
          .setStyle(ButtonStyle.Success),
      );
    }

    if (this.isStarted && !this.isFinished) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`${this._id}__stop`)
          .setLabel("Stop")
          .setStyle(ButtonStyle.Danger),
      );
    } else if (this.isFinished) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`${this._id}__restart`)
          .setLabel("Recommencer")
          .setStyle(ButtonStyle.Primary),
      );
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`${this._id}__stop`)
          .setLabel("Arrêter")
          .setStyle(ButtonStyle.Danger),
      );
    }

    return buttons.length > 0 ? new ActionRowBuilder().addComponents(...buttons) : null;
  }

  embed() {
    const showedStatus =
      this._status === "waiting"
        ? "Pas encore commencé"
        : this._status === "finished"
        ? "Fini 🎉"
        : this._isInBreak
        ? "Pause"
        : "Travail";

    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Pomodoro Timer !")
      .setDescription(this._description)
      .setAuthor({
        name: "Pomodoroo",
        iconURL: "https://www.publicbooks.org/wp-content/uploads/2017/01/book-e1484158615982.jpg",
        url: "https://github.com/Maxentr",
      })
      .addFields(
        {
          name: "\u200b",
          value: "\u200b",
          inline: false,
        },
        { name: "Session", value: this.currentSessionFormatted(), inline: true },
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
      );
  }

  async render() {
    const updatedEmbed = this.embed();
    const row = this.buttons();

    const reply = {
      content: "",
      embeds: [updatedEmbed],
    };

    if (row) reply.components = [row];
    else reply.components = [];

    await this._interaction.editReply(reply);
  }

  createInterval() {
    return setInterval(() => {
      this._currentTimer--;

      if (this._currentTimer < 0 && this._isInBreak) {
        this.triggerSound();

        this._isInBreak = false;
        this._currentTimer = this._workDuration;
        this._currentSession++;
      } else if (this._currentTimer < 0) {
        if (this._currentSession + 1 > this._nbSession) {
          this.end();
          return;
        }
        this.triggerSound();

        this._isInBreak = true;

        if (this._currentSession % 4 === 0) {
          this._currentTimer = this._longPauseDuration;
        } else {
          this._currentTimer = this._pauseDuration;
        }
      }

      this.render();
    }, 1000);
  }

  firstDisplay() {
    const embed = this.embed();
    const row = this.buttons();

    this._interaction.reply({
      content: "",
      embeds: [embed],
      components: [row],
    });
  }

  async start() {
    this._status = "running";
    this._currentSession = 1;
    this._currentTimer = this._workDuration;
    await this.render();
    this._timer = this.createInterval();
  }

  async pause() {
    clearInterval(this._timer);
    this._status = "paused";
    await this.render();
  }

  async resume() {
    this._status = "running";
    await this.render();
    this._timer = this.createInterval();
  }

  async stop() {
    clearInterval(this._timer);
    this._status = "stopped";
    this._connection.disconnect();
    await this._interaction.deleteReply();
  }

  async restart() {
    this._status = "running";
    this._currentSession = 1;
    this._currentTimer = this._workDuration;
    await this.render();
    this._timer = this.createInterval();
  }

  async end() {
    const audioPlayer = createAudioPlayer();
    audioPlayer.play(pingSound);
    const subscription = this._connection.subscribe(audioPlayer);

    audioPlayer.on("stateChange", (oldState, newState) => {
      if (newState.status === "idle") {
        subscription.unsubscribe();
        // wait 1.5 more seconds before disconnecting
        setTimeout(() => {
          this._connection.disconnect();
        }, 1500);
      }
    });

    clearInterval(this._timer);
    this._status = "finished";
    await this.render();
  }
}

module.exports = Pomodoro;
