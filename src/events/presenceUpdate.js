'use strict';
const {getPool}=require('../database');
const active=s=>Boolean(s&&s.status&&s.status!=='offline');
module.exports={
 name:'presenceUpdate',
 async execute(oldPresence,newPresence){
  const p=newPresence||oldPresence;if(!p?.guild||!p.userId)return;
  const was=active(oldPresence),is=active(newPresence);if(was===is)return;
  const db=getPool(),guildId=p.guild.id,userId=p.userId;
  await db.query('CREATE TABLE IF NOT EXISTS presence_stats(guild_id TEXT NOT NULL,user_id TEXT NOT NULL,online_seconds BIGINT DEFAULT 0,online_since TIMESTAMPTZ,updated_at TIMESTAMPTZ DEFAULT NOW(),PRIMARY KEY(guild_id,user_id))');
  if(is){
   await db.query('INSERT INTO presence_stats(guild_id,user_id,online_seconds,online_since,updated_at) VALUES($1,$2,0,NOW(),NOW()) ON CONFLICT(guild_id,user_id) DO UPDATE SET online_since=COALESCE(presence_stats.online_since,NOW()),updated_at=NOW()',[guildId,userId]);
  }else{
   await db.query('UPDATE presence_stats SET online_seconds=online_seconds+GREATEST(0,EXTRACT(EPOCH FROM (NOW()-online_since))::BIGINT),online_since=NULL,updated_at=NOW() WHERE guild_id=$1 AND user_id=$2',[guildId,userId]);
  }
 }
};
