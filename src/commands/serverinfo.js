'use strict';
const {SlashCommandBuilder,EmbedBuilder}=require('discord.js');
const {getServerStats,upsertServerStats}=require('../database/statsRepository');
module.exports={data:new SlashCommandBuilder().setName('serverinfo').setDescription('Thông tin máy chủ'),async execute(i){
 const g=i.guild;if(!g)return i.reply({content:'Chỉ dùng trong server.',ephemeral:true});await upsertServerStats(g.id,g.createdAt.toISOString(),g.memberCount);const s=await getServerStats(g.id);
 const e=new EmbedBuilder().setColor(0x57f287).setTitle('📊 '+g.name).setThumbnail(g.iconURL()).addFields({name:'Thành viên',value:String(g.memberCount),inline:true},{name:'Tạo lúc',value:'<t:'+Math.floor(g.createdTimestamp/1000)+':D>',inline:true},{name:'Chủ server',value:'<@'+g.ownerId+'>',inline:true},{name:'Đã xác minh',value:String(g.verified),inline:true},{name:'Kênh',value:String(g.channels.cache.size),inline:true},{name:'Đồng bộ',value:s?.last_updated?new Date(s.last_updated).toISOString():'Chưa có'}).setTimestamp();await i.reply({embeds:[e]});
}};
