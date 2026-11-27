'use strict';
const {Events}=require('discord.js');
const {upsertServerStats}=require('../database/statsRepository');
const {getPool}=require('../database');
const logger=require('../utils/logger');
module.exports={name:Events.ClientReady,once:true,async execute(client){
 logger.info('Bot ready: '+client.user.tag);
 await getPool().query('CREATE TABLE IF NOT EXISTS presence_stats(guild_id TEXT NOT NULL,user_id TEXT NOT NULL,online_seconds BIGINT DEFAULT 0,online_since TIMESTAMPTZ,updated_at TIMESTAMPTZ DEFAULT NOW(),PRIMARY KEY(guild_id,user_id))');
 for(const guild of client.guilds.cache.values()){try{await upsertServerStats(guild.id,guild.createdAt.toISOString(),guild.memberCount);for(const presence of guild.presences.cache.values()){if(presence.status!=='offline')await getPool().query('INSERT INTO presence_stats(guild_id,user_id,online_seconds,online_since,updated_at) VALUES($1,$2,0,NOW(),NOW()) ON CONFLICT(guild_id,user_id) DO UPDATE SET online_since=COALESCE(presence_stats.online_since,NOW()),updated_at=NOW()',[guild.id,presence.userId]);}}catch(e){logger.error('Server stats/presence sync failed '+guild.id,e.message);}}
}};
