'use strict';
const {SlashCommandBuilder,EmbedBuilder}=require('discord.js');
const {getUserStats}=require('../database/statsRepository');
module.exports={data:new SlashCommandBuilder().setName('stats').setDescription('Xem thống kê hoạt động').addUserOption(o=>o.setName('user').setDescription('Thành viên').setRequired(false)),async execute(i){
 if(!i.guildId)return i.reply({content:'Chỉ dùng trong server.',ephemeral:true});const u=i.options.getUser('user')||i.user,s=await getUserStats(u.id,i.guildId);
 const e=new EmbedBuilder().setColor(0x5865f2).setAuthor({name:u.tag,iconURL:u.displayAvatarURL()}).setTitle('Activity Stats').addFields({name:'Tin nhắn',value:String(s.total_messages),inline:true},{name:'Lượt vào voice',value:String(s.voice_joins),inline:true},{name:'Thời gian voice',value:Math.floor(s.total_voice_join/3600)+' giờ',inline:true}).setFooter({text:s.last_updated?'Cập nhật: '+new Date(s.last_updated).toISOString():'Chưa có dữ liệu'});await i.reply({embeds:[e]});
}};
