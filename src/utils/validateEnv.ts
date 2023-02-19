const validateEnv = (): void => {
  if (!process.env.DISCORD_TOKEN) {
    console.warn("Missing Discord bot token")
    process.exit(1)
  }

  if (!process.env.DISCORD_APPLICATION_ID) {
    console.warn("Missing Discord application id")
    process.exit(1)
  }

  if (!process.env.DISCORD_SERVER_ID) {
    console.warn("Missing Discord server id")
    process.exit(1)
  }
}

export { validateEnv }
