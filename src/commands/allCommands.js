'use strict';
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { getPool } = require('../database');

const owner = new SlashCommandBuilder().setDMPermission(false);
const mod = (name, description, permission) => new SlashCommandBuilder().setName(name).setDescription(description).setDMPermission(false).setDefaultMemberPermissions(permission);
const userOpt = (b) => b.addUserOption(o => o.setName('user').setDescription('Thành viên').setRequired(true));
const reasonOpt = (b) => b.addStringOption(o => o.setName('reason').setDescription('Lý do').setRequired(false).setMaxLength(500));
const commands = [];

commands.push({data:new SlashCommandBuilder().setName('help').setDescription('Danh sách lệnh NTCYT'),async execute(i){
 const e=new EmbedBuilder().setColor(0x8b5cf6).setTitle('NTCYT • Danh sách lệnh').setDescription(
 '**Thông tin:** /ping, /botinfo, /userinfo, /avatar, /serverinfo, /stats, /leaderboard, /top-online\n'+
 '**Tiện ích:** /poll, /embed, /say\n'+
 '**Kiểm duyệt:** /ban, /unban, /kick, /timeout, /untimeout, /purge, /warn, /warnings, /lock, /unlock, /slowmode, /nick\n'+
 '**Vai trò:** /role-add, /role-remove, /role-create, /role-delete\n'+
 '**Hỗ trợ:** /ticket-create, /ticket-close\n'+
 '**Giveaway:** /giveaway-start, /giveaway-end, /giveaway-reroll\n'+
 '**Khác:** /manage'
 ).setFooter({text:'Lệnh quản trị yêu cầu quyền Discord tương ứng.'});
 await i.reply({embeds:[e],ephemeral:true});
}});
commands.push({data:new SlashCommandBuilder().setName('ping').setDescription('Kiểm tra độ trễ bot'),async execute(i){
 const t=Date.now();await i.reply('🏓 Pong!');await i.editReply('🏓 Pong! API: '+i.client.ws.ping+' ms • Round-trip: '+(Date.now()-t)+' ms');
}});
commands.push({data:new SlashCommandBuilder().setName('botinfo').setDescription('Thông tin bot'),async execute(i){
 const e=new EmbedBuilder().setColor(0x5865f2).setTitle('🤖 '+i.client.user.tag).setThumbnail(i.client.user.displayAvatarURL())
 .addFields({name:'Server',value:String(i.client.guilds.cache.size),inline:true},{name:'Ping',value:i.client.ws.ping+' ms',inline:true},{name:'Uptime',value:Math.floor(i.client.uptime/3600000)+' giờ',inline:true});
 await i.reply({embeds:[e]});
}});
commands.push({data:new SlashCommandBuilder().setName('userinfo').setDescription('Thông tin thành viên').addUserOption(o=>o.setName('user').setDescription('Thành viên').setRequired(false)),async execute(i){
 const u=i.options.getUser('user')||i.user,m=await i.guild.members.fetch(u.id).catch(()=>null);
 const e=new EmbedBuilder().setColor(0x5865f2).setTitle(u.tag).setThumbnail(u.displayAvatarURL()).addFields({name:'ID',value:u.id},{name:'Tạo tài khoản',value:'<t:'+Math.floor(u.createdTimestamp/1000)+':F>',inline:true},{name:'Vào server',value:m?.joinedTimestamp?'<t:'+Math.floor(m.joinedTimestamp/1000)+':F>':'Không rõ',inline:true});
 await i.reply({embeds:[e]});
}});
commands.push({data:new SlashCommandBuilder().setName('avatar').setDescription('Xem avatar thành viên').addUserOption(o=>o.setName('user').setDescription('Thành viên').setRequired(false)),async execute(i){
 const u=i.options.getUser('user')||i.user,url=u.displayAvatarURL({size:1024});
 await i.reply({embeds:[new EmbedBuilder().setTitle('Avatar • '+u.tag).setImage(url).setURL(url)]});
}});
commands.push({data:new SlashCommandBuilder().setName('poll').setDescription('Tạo bình chọn').addStringOption(o=>o.setName('question').setDescription('Câu hỏi').setRequired(true).setMaxLength(250)).addStringOption(o=>o.setName('option1').setDescription('Lựa chọn 1').setRequired(true).setMaxLength(80)).addStringOption(o=>o.setName('option2').setDescription('Lựa chọn 2').setRequired(true).setMaxLength(80)).addStringOption(o=>o.setName('option3').setDescription('Lựa chọn 3').setRequired(false).setMaxLength(80)).addStringOption(o=>o.setName('option4').setDescription('Lựa chọn 4').setRequired(false).setMaxLength(80)),async execute(i){
 const a=[i.options.getString('option1'),i.options.getString('option2'),i.options.getString('option3'),i.options.getString('option4')].filter(Boolean),em=['1️⃣','2️⃣','3️⃣','4️⃣'];
 const e=new EmbedBuilder().setColor(0x57f287).setTitle(i.options.getString('question')).setDescription(a.map((x,n)=>em[n]+' '+x).join('\n')).setFooter({text:'React để bình chọn'});
 await i.reply({embeds:[e]});const m=await i.fetchReply();for(let n=0;n<a.length;n++)await m.react(em[n]);
}});
commands.push({data:mod('embed','Tạo embed',PermissionFlagsBits.ManageMessages).addStringOption(o=>o.setName('title').setDescription('Tiêu đề').setRequired(true).setMaxLength(256)).addStringOption(o=>o.setName('description').setDescription('Nội dung').setRequired(true).setMaxLength(4000)).addStringOption(o=>o.setName('color').setDescription('Mã màu HEX').setRequired(false)),async execute(i){
 const c=(i.options.getString('color')||'5865f2').replace('#','');if(!/^[0-9a-fA-F]{6}$/.test(c))return i.reply({content:'Mã màu HEX không hợp lệ.',ephemeral:true});
 await i.channel.send({embeds:[new EmbedBuilder().setColor(parseInt(c,16)).setTitle(i.options.getString('title')).setDescription(i.options.getString('description')).setFooter({text:'Gửi bởi '+i.user.tag})]});await i.reply({content:'Đã gửi embed.',ephemeral:true});
}});
commands.push({data:mod('say','Cho bot gửi tin nhắn',PermissionFlagsBits.ManageMessages).addStringOption(o=>o.setName('message').setDescription('Nội dung').setRequired(true).setMaxLength(1900)),async execute(i){
 await i.channel.send({content:i.options.getString('message'),allowedMentions:{parse:[]}});await i.reply({content:'Đã gửi.',ephemeral:true});
}});

commands.push({data:userOpt(mod('ban','Ban thành viên',PermissionFlagsBits.BanMembers)).addStringOption(o=>o.setName('reason').setDescription('Lý do').setRequired(false)).addIntegerOption(o=>o.setName('delete_days').setDescription('Xóa tin nhắn 0-7 ngày').setMinValue(0).setMaxValue(7)),async execute(i){
 const u=i.options.getUser('user'),m=await i.guild.members.fetch(u.id).catch(()=>null);if(m&&(!m.bannable||m.roles.highest.position>=i.member.roles.highest.position))return i.reply({content:'Không thể ban do quyền hoặc thứ bậc role.',ephemeral:true});
 await i.guild.members.ban(u,{reason:i.options.getString('reason')||'Không nêu lý do',deleteMessageSeconds:(i.options.getInteger('delete_days')||0)*86400});await i.reply('🔨 Đã ban '+u.tag+'.');
}});
commands.push({data:mod('unban','Gỡ ban bằng User ID',PermissionFlagsBits.BanMembers).addStringOption(o=>o.setName('user_id').setDescription('Discord User ID').setRequired(true)),async execute(i){
 const id=i.options.getString('user_id');if(!/^\d{17,20}$/.test(id))return i.reply({content:'User ID không hợp lệ.',ephemeral:true});await i.guild.members.unban(id);await i.reply('Đã gỡ ban ID '+id+'.');
}});
commands.push({data:userOpt(mod('kick','Kick thành viên',PermissionFlagsBits.KickMembers)).addStringOption(o=>o.setName('reason').setDescription('Lý do').setRequired(false)),async execute(i){
 const u=i.options.getUser('user'),m=await i.guild.members.fetch(u.id).catch(()=>null);if(!m||!m.kickable||m.roles.highest.position>=i.member.roles.highest.position)return i.reply({content:'Không thể kick thành viên này.',ephemeral:true});await m.kick(i.options.getString('reason')||'Không nêu lý do');await i.reply('Đã kick '+u.tag+'.');
}});
commands.push({data:userOpt(mod('timeout','Timeout thành viên',PermissionFlagsBits.ModerateMembers)).addStringOption(o=>o.setName('duration').setDescription('Ví dụ 10m, 2h, 1d').setRequired(true)).addStringOption(o=>o.setName('reason').setDescription('Lý do').setRequired(false)),async execute(i){
 const u=i.options.getUser('user'),m=await i.guild.members.fetch(u.id).catch(()=>null),x=/^(\d+)(s|m|h|d)$/.exec(i.options.getString('duration')),factor={s:1000,m:60000,h:3600000,d:86400000};const d=x?Number(x[1])*factor[x[2]]:0;
 if(!d||d>28*86400000)return i.reply({content:'Thời lượng không hợp lệ (tối đa 28 ngày).',ephemeral:true});if(!m||!m.moderatable||m.roles.highest.position>=i.member.roles.highest.position)return i.reply({content:'Không thể timeout thành viên này.',ephemeral:true});await m.timeout(d,i.options.getString('reason')||'Không nêu lý do');await i.reply('Đã timeout '+u.tag+' trong '+i.options.getString('duration')+'.');
}});
commands.push({data:userOpt(mod('untimeout','Gỡ timeout',PermissionFlagsBits.ModerateMembers)),async execute(i){
 const u=i.options.getUser('user'),m=await i.guild.members.fetch(u.id).catch(()=>null);if(!m||!m.moderatable)return i.reply({content:'Không thể gỡ timeout.',ephemeral:true});await m.timeout(null);await i.reply('Đã gỡ timeout '+u.tag+'.');
}});
commands.push({data:mod('purge','Xóa 1-100 tin nhắn gần đây',PermissionFlagsBits.ManageMessages).addIntegerOption(o=>o.setName('amount').setDescription('Số lượng 1-100').setRequired(true).setMinValue(1).setMaxValue(100)),async execute(i){
 await i.deferReply({ephemeral:true});const r=await i.channel.bulkDelete(i.options.getInteger('amount'),true);await i.editReply('Đã xóa '+r.size+' tin nhắn. Tin quá 14 ngày bị Discord bỏ qua.');
}});
for(const [name,desc,perm,action] of [
 ['lock','Khóa kênh',PermissionFlagsBits.ManageChannels,'lock'],['unlock','Mở khóa kênh',PermissionFlagsBits.ManageChannels,'unlock']
])commands.push({data:mod(name,desc,perm),async execute(i){
 await i.channel.permissionOverwrites.edit(i.guild.roles.everyone,{SendMessages:action==='lock'?false:null});await i.reply(action==='lock'?'🔒 Đã khóa kênh.':'🔓 Đã mở khóa kênh.');
}});
commands.push({data:mod('slowmode','Đặt slowmode cho kênh',PermissionFlagsBits.ManageChannels).addIntegerOption(o=>o.setName('seconds').setDescription('0-21600 giây').setRequired(true).setMinValue(0).setMaxValue(21600)),async execute(i){
 const s=i.options.getInteger('seconds');await i.channel.setRateLimitPerUser(s);await i.reply('Slowmode đã đặt: '+s+' giây.');
}});
commands.push({data:userOpt(mod('nick','Đổi biệt danh thành viên',PermissionFlagsBits.ManageNicknames)).addStringOption(o=>o.setName('nickname').setDescription('Tên mới, bỏ trống để xóa').setRequired(false).setMaxLength(32)),async execute(i){
 const u=i.options.getUser('user'),m=await i.guild.members.fetch(u.id).catch(()=>null);if(!m||!m.manageable||m.roles.highest.position>=i.member.roles.highest.position)return i.reply({content:'Không thể đổi biệt danh thành viên này.',ephemeral:true});await m.setNickname(i.options.getString('nickname'));await i.reply('Đã cập nhật biệt danh cho '+u.tag+'.');
}});
commands.push({data:userOpt(mod('warn','Cảnh cáo thành viên',PermissionFlagsBits.ModerateMembers)).addStringOption(o=>o.setName('reason').setDescription('Lý do').setRequired(true).setMaxLength(500)),async execute(i){
 const u=i.options.getUser('user'),p=getPool();await p.query('CREATE TABLE IF NOT EXISTS moderation_warnings(id BIGSERIAL PRIMARY KEY,guild_id TEXT,user_id TEXT,moderator_id TEXT,reason TEXT,created_at TIMESTAMPTZ DEFAULT NOW())');await p.query('INSERT INTO moderation_warnings(guild_id,user_id,moderator_id,reason) VALUES($1,$2,$3,$4)',[i.guildId,u.id,i.user.id,i.options.getString('reason')]);await i.reply('⚠️ Đã lưu cảnh cáo cho '+u.tag+'.');
}});
commands.push({data:userOpt(mod('warnings','Xem cảnh cáo thành viên',PermissionFlagsBits.ModerateMembers)),async execute(i){
 const u=i.options.getUser('user'),p=getPool();await p.query('CREATE TABLE IF NOT EXISTS moderation_warnings(id BIGSERIAL PRIMARY KEY,guild_id TEXT,user_id TEXT,moderator_id TEXT,reason TEXT,created_at TIMESTAMPTZ DEFAULT NOW())');const r=await p.query('SELECT reason,moderator_id,created_at FROM moderation_warnings WHERE guild_id=$1 AND user_id=$2 ORDER BY id DESC LIMIT 10',[i.guildId,u.id]);const d=r.rows.map((x,n)=>'**'+(n+1)+'.** '+x.reason+' • <@'+x.moderator_id+'> • <t:'+Math.floor(new Date(x.created_at).getTime()/1000)+':R>').join('\n')||'Chưa có cảnh cáo.';await i.reply({embeds:[new EmbedBuilder().setTitle('Cảnh cáo • '+u.tag).setDescription(d)],ephemeral:true});
}});

for(const [name,action] of [['role-add','add'],['role-remove','remove']])commands.push({data:mod(name,'Thêm hoặc gỡ role',PermissionFlagsBits.ManageRoles).addUserOption(o=>o.setName('user').setDescription('Thành viên').setRequired(true)).addRoleOption(o=>o.setName('role').setDescription('Vai trò').setRequired(true)),async execute(i){
 const u=i.options.getUser('user'),r=i.options.getRole('role'),m=await i.guild.members.fetch(u.id),bot=i.guild.members.me;if(r.managed||r.position>=bot.roles.highest.position||r.position>=i.member.roles.highest.position)return i.reply({content:'Role vượt thứ bậc cho phép.',ephemeral:true});if(action==='add')await m.roles.add(r);else await m.roles.remove(r);await i.reply('Đã '+(action==='add'?'thêm':'gỡ')+' '+r.toString()+' '+(action==='add'?'cho ':'khỏi ')+u.tag+'.');
}});
commands.push({data:mod('role-create','Tạo role',PermissionFlagsBits.ManageRoles).addStringOption(o=>o.setName('name').setDescription('Tên role').setRequired(true).setMaxLength(100)).addStringOption(o=>o.setName('color').setDescription('Mã màu HEX').setRequired(false)),async execute(i){
 const c=(i.options.getString('color')||'99aab5').replace('#','');if(!/^[0-9a-fA-F]{6}$/.test(c))return i.reply({content:'Mã màu không hợp lệ.',ephemeral:true});const r=await i.guild.roles.create({name:i.options.getString('name'),color:parseInt(c,16)});await i.reply('Đã tạo '+r.toString()+'.');
}});
commands.push({data:mod('role-delete','Xóa role',PermissionFlagsBits.ManageRoles).addRoleOption(o=>o.setName('role').setDescription('Vai trò').setRequired(true)),async execute(i){
 const r=i.options.getRole('role'),bot=i.guild.members.me;if(r.managed||r.position>=bot.roles.highest.position||r.position>=i.member.roles.highest.position)return i.reply({content:'Không thể xóa role này do thứ bậc.',ephemeral:true});await r.delete();await i.reply('Đã xóa role '+r.name+'.');
}});

commands.push({data:new SlashCommandBuilder().setName('ticket-create').setDescription('Tạo ticket hỗ trợ').setDMPermission(false).addStringOption(o=>o.setName('subject').setDescription('Chủ đề').setRequired(false).setMaxLength(100)),async execute(i){
 const old=i.guild.channels.cache.find(c=>c.type===ChannelType.GuildText&&c.topic==='ticket-owner:'+i.user.id);if(old)return i.reply({content:'Bạn đã có ticket: '+old.toString(),ephemeral:true});
 const ch=await i.guild.channels.create({name:'ticket-'+i.user.username.toLowerCase().replace(/[^a-z0-9-]/g,'').slice(0,18),type:ChannelType.GuildText,topic:'ticket-owner:'+i.user.id,permissionOverwrites:[{id:i.guild.roles.everyone.id,deny:[PermissionFlagsBits.ViewChannel]},{id:i.user.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]},{id:i.client.user.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ManageChannels]}]});await ch.send('🎫 Ticket của '+i.user.toString()+' • Chủ đề: '+(i.options.getString('subject')||'Chưa cung cấp')+'. Dùng /ticket-close để đóng.');await i.reply({content:'Ticket đã tạo: '+ch.toString(),ephemeral:true});
}});
commands.push({data:new SlashCommandBuilder().setName('ticket-close').setDescription('Đóng ticket hiện tại').setDMPermission(false),async execute(i){
 if(!i.channel.topic?.startsWith('ticket-owner:'))return i.reply({content:'Đây không phải ticket.',ephemeral:true});const ownerId=i.channel.topic.slice(13);if(i.user.id!==ownerId&&!i.memberPermissions.has(PermissionFlagsBits.ManageChannels))return i.reply({content:'Chỉ chủ ticket hoặc moderator được đóng.',ephemeral:true});await i.reply('Ticket sẽ đóng sau 5 giây.');setTimeout(()=>i.channel.delete('Ticket closed').catch(()=>{}),5000);
}});

const giveawayDuration=v=>{const m=/^(\d+)(m|h|d)$/.exec(v||'');return m?Number(m[1])*({m:60000,h:3600000,d:86400000}[m[2]]):0;};
async function pickWinners(i,id,reroll){
 const msg=await i.channel.messages.fetch(id).catch(()=>null);
 if(!msg)return i.reply({content:'Không tìm thấy tin nhắn giveaway trong kênh này.',ephemeral:true});
 const source=msg.embeds[0];if(!source)return i.reply({content:'Tin nhắn không có embed giveaway.',ephemeral:true});
 const footer=source.footer?.text||'';if(reroll&&!footer.includes('Ended'))return i.reply({content:'Chỉ có thể reroll giveaway đã kết thúc.',ephemeral:true});
 if(!reroll&&footer.includes('Ended'))return i.reply({content:'Giveaway này đã kết thúc rồi. Dùng giveaway-reroll để chọn lại.',ephemeral:true});
 const reaction=msg.reactions.cache.get('🎉');if(!reaction)return i.reply({content:'Không tìm thấy reaction tham gia.',ephemeral:true});
 const users=await reaction.users.fetch(),prior=(footer.match(/WinnerIDs:([0-9,]+)/)||[])[1]||'',excluded=new Set(prior.split(',').filter(Boolean));
 const pool=users.filter(u=>!u.bot&&!excluded.has(u.id)).map(u=>u);if(!pool.length)return i.reply({content:'Không còn người tham gia hợp lệ để chọn.',ephemeral:true});
 const n=Number((footer.match(/Winners:(\d+)/)||[])[1]||1),w=[];while(pool.length&&w.length<n)w.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
 const ids=[...excluded,...w.map(u=>u.id)],updated=EmbedBuilder.from(source).setFooter({text:'Ended • Winners:'+n+' • WinnerIDs:'+ids.join(',')});
 if(!reroll)updated.setTitle('🎉 GIVEAWAY • ĐÃ KẾT THÚC');
 await msg.edit({embeds:[updated]});
 await i.reply((reroll?'🔁 Người thắng mới: ':'🎉 Người thắng: ')+w.map(u=>u.toString()).join(', '));
}
commands.push({data:mod('giveaway-start','Tạo giveaway',PermissionFlagsBits.ManageGuild).addStringOption(o=>o.setName('prize').setDescription('Phần thưởng').setRequired(true).setMaxLength(200)).addStringOption(o=>o.setName('duration').setDescription('30m, 2h hoặc 1d').setRequired(true)).addIntegerOption(o=>o.setName('winners').setDescription('Số người thắng').setRequired(true).setMinValue(1).setMaxValue(20)),async execute(i){
 const d=giveawayDuration(i.options.getString('duration'));if(!d||d>30*86400000)return i.reply({content:'Thời lượng không hợp lệ, tối đa 30 ngày.',ephemeral:true});const e=new EmbedBuilder().setColor(0xfee75c).setTitle('🎉 GIVEAWAY').setDescription('**Phần thưởng:** '+i.options.getString('prize')+'\n**Kết thúc:** <t:'+Math.floor((Date.now()+d)/1000)+':R>\nReact 🎉 để tham gia.').setFooter({text:'Winners:'+i.options.getInteger('winners')});await i.reply({embeds:[e]});const m=await i.fetchReply();await m.react('🎉');
}});
commands.push({data:mod('giveaway-end','Kết thúc giveaway theo Message ID',PermissionFlagsBits.ManageGuild).addStringOption(o=>o.setName('message_id').setDescription('ID tin nhắn giveaway').setRequired(true)),async execute(i){await pickWinners(i,i.options.getString('message_id'),false);}});
commands.push({data:mod('giveaway-reroll','Chọn lại người thắng chưa từng thắng',PermissionFlagsBits.ManageGuild).addStringOption(o=>o.setName('message_id').setDescription('ID tin nhắn giveaway').setRequired(true)),async execute(i){await pickWinners(i,i.options.getString('message_id'),true);}});
commands.push({data:new SlashCommandBuilder().setName('top-online').setDescription('Bảng xếp hạng thời gian online được bot ghi nhận').setDMPermission(false),async execute(i){
 const p=getPool();await p.query('CREATE TABLE IF NOT EXISTS presence_stats(guild_id TEXT,user_id TEXT,online_seconds BIGINT DEFAULT 0,updated_at TIMESTAMPTZ DEFAULT NOW(),PRIMARY KEY(guild_id,user_id))');const r=await p.query('SELECT user_id,(online_seconds+CASE WHEN online_since IS NOT NULL THEN GREATEST(0,EXTRACT(EPOCH FROM (NOW()-online_since))::BIGINT) ELSE 0 END) AS total_seconds FROM presence_stats WHERE guild_id=$1 ORDER BY total_seconds DESC LIMIT 10',[i.guildId]);const d=r.rows.map((x,n)=>'**#'+(n+1)+'** <@'+x.user_id+'> • '+Math.floor(Number(x.total_seconds)/3600)+' giờ').join('\n')||'Chưa có dữ liệu. Bật Server Members + Presence Intent để bắt đầu ghi nhận.';await i.reply({embeds:[new EmbedBuilder().setTitle('🟢 Top online').setDescription(d).setColor(0x57f287)]});
}});

module.exports = commands;
