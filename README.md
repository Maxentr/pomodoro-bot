# Pomodoro Discord Bot

A simple Discord bot that allows you to use the Pomodoro technique in your Discord server.

## Features

- Start a Pomodoro session
- Pause a Pomodoro session
- Resume a Pomodoro session
- Stop a Pomodoro session
- Set a custom Pomodoro session length
- Restart a Pomodoro session

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

- Refactor the code to make it more readable