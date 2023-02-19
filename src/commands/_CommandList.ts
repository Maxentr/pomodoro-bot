import { CommandListInt } from "../types/CommandInt"
import pomodoroButtonsHandler from "./pomodoro/buttonInteraction"
import pomodoro from "./pomodoro/command"

const CommandList: CommandListInt[] = [
  {
    command: pomodoro,
    buttonInteractionHandler: pomodoroButtonsHandler,
  },
]

export { CommandList }
