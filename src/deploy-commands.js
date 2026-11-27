'use strict';

require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
  throw new Error('Missing DISCORD_TOKEN or CLIENT_ID');
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

for (const file of fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))) {
  const loaded = require(path.join(commandsPath, file));
  const list = Array.isArray(loaded) ? loaded : [loaded];
  for (const command of list) {
    if (!command?.data || typeof command.execute !== 'function') {
      console.warn('Skipping invalid command export:', file);
      continue;
    }
    commands.push(command.data.toJSON());
  }
}

const names = commands.map(command => command.name);
if (new Set(names).size !== names.length) {
  throw new Error('Duplicate slash command names detected.');
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    if (process.env.GUILD_ID) {
      console.log('Clearing old guild commands...');
      await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: [] });
    }

    console.log('Clearing old global commands...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });

    console.log('Registering', commands.length, 'global slash commands...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('Slash commands registered successfully.');
  } catch (error) {
    console.error('Command deployment failed:', error);
    process.exitCode = 1;
  }
})();
