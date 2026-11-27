'use strict';
require('dotenv').config();
const {Client,GatewayIntentBits,REST,Routes,Collection}=require('discord.js');
const fs=require('fs');const path=require('path');
const {initDb}=require('./database');const statsRepo=require('./database/statsRepository');const logger=require('./utils/logger');const {voiceSessions}=require('./events/voiceStateUpdate');
const client=new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent,GatewayIntentBits.GuildVoiceStates,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildPresences]});
client.commands=new Collection();
async function flushVoiceSessions(){if(!voiceSessions?.size)return;const now=Date.now();for(const [key,start] of voiceSessions){const [userId,guildId]=key.split('-');const seconds=Math.floor((now-start)/1000);if(seconds>0)try{await statsRepo.updateStats(userId,guildId,{messages:0,voiceTime:seconds});}catch(e){logger.error('Voice flush failed:',e.message);}}voiceSessions.clear();}
process.on('SIGTERM',async()=>{await flushVoiceSessions();process.exit(0);});process.on('SIGINT',async()=>{await flushVoiceSessions();process.exit(0);});
function loadCommands(){
 const dir=path.join(__dirname,'commands');if(!fs.existsSync(dir))return[];const out=[];
 for(const file of fs.readdirSync(dir).filter(x=>x.endsWith('.js'))){const loaded=require(path.join(dir,file));const list=Array.isArray(loaded)?loaded:[loaded];
  for(const command of list){if(command?.data&&typeof command.execute==='function'){if(client.commands.has(command.data.name))throw new Error('Duplicate slash command: '+command.data.name);client.commands.set(command.data.name,command);out.push(command.data.toJSON());}else logger.warn('Invalid command export in '+file);}
 }return out;
}
function loadEvents(){const dir=path.join(__dirname,'events');if(!fs.existsSync(dir))return;for(const file of fs.readdirSync(dir).filter(x=>x.endsWith('.js'))){const event=require(path.join(dir,file));if(event.once)client.once(event.name,(...args)=>event.execute(...args));else client.on(event.name,(...args)=>event.execute(...args));}}
client.once('ready',async()=>{logger.info('Bot ready: '+client.user.tag);try{const data=loadCommands();const rest=new REST({version:'10'}).setToken(process.env.DISCORD_TOKEN);for(const guild of client.guilds.cache.values()){await rest.put(Routes.applicationGuildCommands(client.user.id,guild.id),{body:[]});logger.info('Cleared old guild commands: '+guild.id);}await rest.put(Routes.applicationCommands(client.user.id),{body:[]});logger.info('Cleared all old global commands.');await rest.put(Routes.applicationCommands(client.user.id),{body:data});logger.info('Registered '+data.length+' global slash commands.');}catch(e){logger.error('Command registration failed:',e);}});
client.on('interactionCreate',async i=>{if(!i.isChatInputCommand())return;const command=client.commands.get(i.commandName);if(!command)return;try{await command.execute(i);}catch(e){logger.error('Command failed /'+i.commandName,e);const payload={content:'❌ Có lỗi khi thực hiện lệnh. Kiểm tra log bot để biết chi tiết.',ephemeral:true};if(i.replied||i.deferred)await i.followUp(payload).catch(()=>{});else await i.reply(payload).catch(()=>{});}});
(async()=>{try{if(!process.env.DISCORD_TOKEN)throw new Error('Missing DISCORD_TOKEN');await initDb();loadEvents();await client.login(process.env.DISCORD_TOKEN);}catch(e){logger.error('Bot startup failed:',e);process.exit(1);}})();
