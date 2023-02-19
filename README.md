# Pomodoro Bot

A simple Discord bot that allows you to use the Pomodoro technique in your Discord server.

## Features

- Start a Pomodoro session with a specified type and number of sessions
- Pause the Pomodoro session
- Resume the Pomodoro session
- Stop the Pomodoro session
- Restart the Pomodoro session

## Commands

- `/pomodoro [type] [nbSession]` - Start a Pomodoro session with the specified type and number of sessions

## Types

- `25/5/15` - 25 minutes of work, 5 minutes of break, 15 minutes of long break
- `50/10/30` - 50 minutes of work, 10 minutes of break, 30 minutes of long break

## Examples

- `/pomodoro 25/5/15 4` - Start a Pomodoro session with 4 sessions of 25 minutes of work, 5 minutes of break and 15 minutes of long break

## Installation

1. Clone the repository
2. Install the dependencies with the following command:

```bash
pnpm install
```

3. Copy the `.env.example` file to `.env` and fill in the required fields
4. Start the bot with the following command:

```bash
pnpm start
```

## TODO

- [x] Refactor the code to make it more readable (add TypeScript and prettier)
- [ ] Lock the pomodoro session to user who started it (or allow all users in the channel to interact with it) ?
