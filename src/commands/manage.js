'use strict';
const {SlashCommandBuilder,MessageFlags,PermissionFlagsBits}=require('discord.js');
const {decryptUserId,encryptUserId}=require('../utils/crypto');
const statsRepo=require('../database/statsRepository');
const {getPool}=require('../database');
const BOT_OWNER_ID=process.env.ADMIN_USER_ID||'1397184940239749141';
const data=new SlashCommandBuilder().setName('manage').setDescription('Quản lý thống kê (Bot Owner)').setDMPermission(false).setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
.addSubcommand(s=>s.setName('encode-id').setDescription('Mã hóa ID thành viên').addUserOption(o=>o.setName('target').setDescription('Thành viên').setRequired(true)))
.addSubcommand(s=>s.setName('add').setDescription('Cộng hoặc trừ thống kê').addStringOption(o=>o.setName('type').setDescription('Loại dữ liệu').setRequired(true).addChoices({name:'Tin nhắn',value:'messages'},{name:'Thời gian voice (giây)',value:'voice'},{name:'Lượt vào voice',value:'voice_joins'})).addIntegerOption(o=>o.setName('amount').setDescription('Số lượng, số âm để trừ').setRequired(true)).addUserOption(o=>o.setName('user').setDescription('Thành viên').setRequired(false)).addStringOption(o=>o.setName('encrypted_id').setDescription('ID đã mã hóa').setRequired(false)))
.addSubcommand(s=>s.setName('reset').setDescription('Reset thống kê thành viên').addUserOption(o=>o.setName('user').setDescription('Thành viên').setRequired(false)).addStringOption(o=>o.setName('encrypted_id').setDescription('ID đã mã hóa').setRequired(false)))
.addSubcommand(s=>s.setName('reset-all').setDescription('Reset thống kê toàn server'));
module.exports={data,async execute(i){
 if(i.user.id!==BOT_OWNER_ID)return i.reply({content:'Chỉ Bot Owner được dùng lệnh này.',flags:MessageFlags.Ephemeral});
 const sub=i.options.getSubcommand();
 if(sub==='encode-id'){const u=i.options.getUser('target');return i.reply({content:'Mã ID cho '+u.tag+': '+encryptUserId(u.id),flags:MessageFlags.Ephemeral});}
 if(sub==='reset-all'){const r=await statsRepo.resetAllStats(i.guildId);return i.reply({content:'Đã reset thống kê của '+r.changes+' thành viên.',flags:MessageFlags.Ephemeral});}
 const u=i.options.getUser('user'),enc=i.options.getString('encrypted_id');const id=u?.id||(enc?decryptUserId(enc):null);
 if(!id)return i.reply({content:'Cần chọn user hoặc cung cấp encrypted_id hợp lệ.',flags:MessageFlags.Ephemeral});
 if(sub==='reset'){await statsRepo.resetStats(id,i.guildId);return i.reply({content:'Đã reset thống kê cho ID '+id+'.',flags:MessageFlags.Ephemeral});}
 const type=i.options.getString('type'),amount=i.options.getInteger('amount');
 if(type==='messages')await statsRepo.updateStats(id,i.guildId,{messages:amount,voiceTime:0});
 else if(type==='voice')await statsRepo.updateStats(id,i.guildId,{messages:0,voiceTime:amount});
 else await getPool().query('INSERT INTO user_stats(user_id,guild_id,voice_joins,last_updated) VALUES($1,$2,GREATEST(0,$3),NOW()) ON CONFLICT(user_id,guild_id) DO UPDATE SET voice_joins=GREATEST(0,COALESCE(user_stats.voice_joins,0)+$3),last_updated=NOW()',[id,i.guildId,amount]);
 return i.reply({content:'Đã cập nhật '+amount+' '+type+' cho ID '+id+'.',flags:MessageFlags.Ephemeral});
}};
