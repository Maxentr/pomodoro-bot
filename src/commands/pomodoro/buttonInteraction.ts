import POMODORO_MAP from "../../db/db"
import { buttonInteractionHandler } from "../../types/CommandInt"

const pomodoroButtonsHandler: buttonInteractionHandler = async (
  interaction,
  id,
  state,
) => {
  const pomodoro = POMODORO_MAP.get(id)
  if (!pomodoro) {
    console.log("Pomodoro not found")
    return
  }

  if (state === "start") {
    pomodoro.start()
  } else if (state === "pause") {
    pomodoro.pause()
  } else if (state === "resume") {
    pomodoro.resume()
  } else if (state === "stop") {
    pomodoro.stop()
  } else if (state === "cancel") {
    pomodoro.stop()
  } else if (state === "restart") {
    pomodoro.restart()
  }
}

export default pomodoroButtonsHandler
