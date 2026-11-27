'use strict';
const {Events}=require('discord.js');
const {upsertServerStats}=require('../database/statsRepository');
const {getPool}=require('../database');
const logger=require('../utils/logger');
module.exports={name:Events.ClientReady,once:true,async execute(client){
 logger.info('Bot ready: '+client.user.tag);
 await getPool().query('CREATE TABLE IF NOT EXISTS presence_stats(guild_id TEXT NOT NULL,user_id TEXT NOT NULL,online_seconds BIGINT DEFAULT 0,online_since TIMESTAMPTZ,updated_at TIMESTAMPTZ DEFAULT NOW(),PRIMARY KEY(guild_id,user_id))');
 for(const guild of client.guilds.cache.values()){try{await upsertServerStats(guild.id,guild.createdAt.toISOString(),guild.memberCount);}catch(e){logger.error('Server stats sync failed '+guild.id,e.message);}}
}};
