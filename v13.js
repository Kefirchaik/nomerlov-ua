/* НомерЛов UA v1.3.0 | local-only collector features; no account or payment required */
(()=>{
'use strict';
const api=window.NOMERLOV_APP;
if(!api) return;
const tr=(uk,ru)=>api.state.lang==='ru'?ru:uk;
const fmt=n=>Math.round(Number(n)||0).toLocaleString('uk-UA');
const $=id=>document.getElementById(id);
const plateDigits=code=>{const match=String(code||'').match(/\d{3,4}/);return match?match[0]:''};
const ALBUMS=[
 {id:'seven',icon:'✦',name:['Полювання за сімками','Охота за семёрками'],desc:['Номери із 777','Номера с 777'],goal:1,reward:2200,xp:95,match:(n,item)=>n.includes('777')},
 {id:'mirror',icon:'◇',name:['Дзеркальний ефект','Зеркальный эффект'],desc:['Паліндромні цифри','Палиндромные цифры'],goal:2,reward:1700,xp:80,match:n=>n.length>2&&n===n.split('').reverse().join('')},
 {id:'pairs',icon:'▦',name:['Магія повторів','Магия повторов'],desc:['Повтори 2 або більше цифр','Повторы 2 или более цифр'],goal:3,reward:1800,xp:90,match:n=>/(\d).*\1/.test(n)},
 {id:'sequence',icon:'↗',name:['Цифри по порядку','Цифры по порядку'],desc:['Три цифри поспіль по зростанню або спаданню','Три цифры подряд по возрастанию или убыванию'],goal:2,reward:2500,xp:120,match:n=>{for(let i=0;i<n.length-2;i++){let a=+n[i],b=+n[i+1],c=+n[i+2];if((b===a+1&&c===b+1)||(b===a-1&&c===b-1))return true}return false}},
 {id:'rare',icon:'◆',name:['Колекція рідкісних','Коллекция редких'],desc:['Знахідки від епічної рідкісності','Находки от эпической редкости'],goal:2,reward:4000,xp:200,match:(n,item)=>['epic','legendary','mythic'].includes(item.tier)}
];
const FRAME_LIST=[
 {id:'classic',name:['Класична','Классическая'],sub:['Доступна всім','Доступна всем'],unlock:()=>true},
 {id:'neon',name:['Неон','Неон'],sub:['Впіймай 7 номерів','Поймай 7 номеров'],unlock:s=>s.catches>=7},
 {id:'carbon',name:['Карбон','Карбон'],sub:['Серія входів: 3 дні','Серия входов: 3 дня'],unlock:(s,v)=>v.bestStreak>=3},
 {id:'gold',name:['Золото','Золото'],sub:['Заверши один альбом','Заверши один альбом'],unlock:(s,v)=>v.claimedAlbums.length>0},
 {id:'aurora',name:['Аврора','Аврора'],sub:['Заверши тижневу подію','Заверши недельное событие'],unlock:(s,v)=>v.eventWins>0}
];
const EVENTS=[
 {id:'seven',name:['Тиждень сімок','Неделя семёрок'],desc:['Лови номери з цифрою 7','Лови номера с цифрой 7'],goal:4,coins:3000,xp:150,test:item=>plateDigits(item.code).includes('7')},
 {id:'hunt',name:['Марафон уловів','Марафон уловов'],desc:['Зроби 10 уловів цього тижня','Сделай 10 уловов на этой неделе'],goal:10,coins:2600,xp:140,test:()=>true},
 {id:'rare',name:['Рідкісне полювання','Редкая охота'],desc:['Впіймай 2 рідкісних або кращих номери','Поймай 2 редких или более ценных номера'],goal:2,coins:4400,xp:220,test:item=>['rare','epic','legendary','mythic'].includes(item.tier)}
];
const goodDay=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v);
const dateUTC=day=>goodDay(day)?Date.parse(day+'T12:00:00Z'):NaN;
function weekInfo(){const now=new Date(),utc=new Date(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())),day=utc.getUTCDay()||7;utc.setUTCDate(utc.getUTCDate()-day+1);const start=utc.toISOString().slice(0,10),dayNumber=Math.floor(utc.getTime()/86400000),kind=EVENTS[Math.abs(Math.floor(dayNumber/7))%EVENTS.length];const end=new Date(utc.getTime()+7*86400000),remaining=Math.max(1,Math.ceil((end.getTime()-Date.now())/86400000));return {id:start+':'+kind.id,kind,remaining};}
function progress(){const s=api.state;let v=s.v13;if(!v||typeof v!=='object'||Array.isArray(v))v={};
 v.albumCodes=Array.isArray(v.albumCodes)?v.albumCodes.filter(x=>x&&typeof x.code==='string'&&x.code.length<30&&typeof x.tier==='string').slice(-2500):[];
 v.claimedAlbums=Array.isArray(v.claimedAlbums)?v.claimedAlbums.filter(id=>ALBUMS.some(a=>a.id===id)):[];
 v.frame=FRAME_LIST.some(f=>f.id===v.frame)?v.frame:'classic';
 v.streak=Number.isInteger(v.streak)&&v.streak>=0&&v.streak<10000?v.streak:0;
 v.bestStreak=Number.isInteger(v.bestStreak)&&v.bestStreak>=0&&v.bestStreak<10000?v.bestStreak:0;
 v.streakDay=goodDay(v.streakDay)?v.streakDay:'';
 v.streakRewards=Array.isArray(v.streakRewards)?v.streakRewards.filter(x=>[3,7,14,30].includes(x)):[];
 v.eventId=typeof v.eventId==='string'?v.eventId:'';
 v.eventCount=Number.isInteger(v.eventCount)&&v.eventCount>=0&&v.eventCount<100000?v.eventCount:0;
 v.eventClaimed=!!v.eventClaimed;
 v.eventWins=Number.isInteger(v.eventWins)&&v.eventWins>=0&&v.eventWins<10000?v.eventWins:0;
 s.v13=v;
 return v;
}
function addAlbum(item){const v=progress();if(!item||typeof item.code!=='string'||!plateDigits(item.code))return;const code=item.code.slice(0,29);if(v.albumCodes.some(x=>x.code===code))return;v.albumCodes.push({code,tier:item.tier||'common'});if(v.albumCodes.length>2500)v.albumCodes.shift();}
function migrate(){const v=progress(),s=api.state;if(!v.initialized){for(const item of [...(s.collection||[]),...(s.history||[]),...(s.records||[]),s.current,s.pending].filter(Boolean))addAlbum(item);v.initialized=true;
  if(s.daily===api.todayKey()&&!v.streakDay){v.streak=1;v.bestStreak=Math.max(v.bestStreak,1);v.streakDay=api.todayKey()}
  api.save();
 }
 resetEvent();}
function resetEvent(){const v=progress(),info=weekInfo();if(v.eventId!==info.id){v.eventId=info.id;v.eventCount=0;v.eventClaimed=false;api.save()}return info;}
function addCatch(item){addAlbum(item);const info=resetEvent(),v=progress();if(!v.eventClaimed&&info.kind.test(item))v.eventCount=Math.min(info.kind.goal,v.eventCount+1);}
function streakClaim(day){const v=progress();if(!goodDay(day)||v.streakDay===day)return;
 const distance=(dateUTC(day)-dateUTC(v.streakDay))/86400000;
 if(distance===1)v.streak+=1;else{v.streak=1;v.streakRewards=[]}
 v.streakDay=day;v.bestStreak=Math.max(v.bestStreak,v.streak);
 for(const m of [3,7,14,30])if(v.streak===m&&!v.streakRewards.includes(m)){
  v.streakRewards.push(m);const coins=m*500;api.state.coins+=coins;api.state.xp+=m*15;
  notify(tr('Бонус за серію!','Бонус за серию!'),`+${fmt(coins)} ₴ · ${m*15} XP`);
 }
}
function notify(heading,body){const stack=$('toasts')||document.body;for(const old of [...stack.children])if(old.dataset.toastTitle===heading)old.remove();while(stack.children.length>=2)stack.firstElementChild?.remove();const el=document.createElement('div');el.className='nl13-toast';el.dataset.toastTitle=heading;el.setAttribute('role','status');const title=document.createElement('strong');title.textContent=heading;const p=document.createElement('span');p.textContent=body;el.append(title,p);stack.append(el);setTimeout(()=>el.remove(),2700)}
function albumProgress(a,v){return v.albumCodes.filter(item=>a.match(plateDigits(item.code),item)).length}
function claimAlbum(id){const a=ALBUMS.find(x=>x.id===id),v=progress();if(!a||v.claimedAlbums.includes(id)||albumProgress(a,v)<a.goal)return;v.claimedAlbums.push(id);api.state.coins+=a.reward;api.state.xp+=a.xp;api.save();api.renderAll();notify(tr('Альбом завершено!','Альбом завершён!'),`+${fmt(a.reward)} ₴ · +${a.xp} XP`)}
function claimEvent(){const v=progress(),e=resetEvent();if(v.eventClaimed||v.eventCount<e.kind.goal)return;v.eventClaimed=true;v.eventWins++;api.state.coins+=e.kind.coins;api.state.xp+=e.kind.xp;api.save();api.renderAll();notify(tr('Подію завершено!','Событие завершено!'),`+${fmt(e.kind.coins)} ₴ · +${e.kind.xp} XP`)}
function frameUnlocked(f){return f.unlock(api.state,progress())}
function chooseFrame(id){const f=FRAME_LIST.find(f=>f.id===id);if(!f||!frameUnlocked(f))return;progress().frame=id;api.save();api.renderAll();notify(tr('Оформлення змінено','Оформление изменено'),tr('Нова рамка застосована','Новая рамка применена'))}
function attachRoot(){if($('nl13Album'))return;
 const collection=$('view-collection'),layout=collection?.querySelector('.collection-layout'),aside=$('view-hunt')?.querySelector('aside.stack'),action=$('actionBar');if(!collection||!layout||!aside||!action)return;
 const album=document.createElement('section');album.className='panel panel-pad nl13-panel';album.id='nl13Album';album.innerHTML='<div class="nl13-heading"><div><span class="nl13-kicker">КОЛЕКЦІОНЕР</span><h2>Альбом номерів</h2><p class="muted nl13-note">Відкривай набори та отримуй нагороди. Враховуються й продані номери.</p></div><span class="nl13-chip" id="nl13AlbumTotal"></span></div><div id="nl13AlbumGrid" class="nl13-albums"></div>';
 const frames=document.createElement('section');frames.className='panel panel-pad nl13-panel';frames.id='nl13Frames';frames.innerHTML='<div class="nl13-heading"><div><span class="nl13-kicker">ДИЗАЙН</span><h2>Рамки номерів</h2><p class="muted nl13-note">Обирай оформлення без впливу на рідкісність.</p></div></div><div id="nl13FrameGrid" class="nl13-frames"></div>';
 collection.insertBefore(album,layout);collection.insertBefore(frames,layout);
 const streak=document.createElement('section');streak.className='panel panel-pad nl13-panel';streak.id='nl13Streak';aside.prepend(streak);
 const event=document.createElement('section');event.className='panel panel-pad nl13-panel';event.id='nl13Event';aside.prepend(event);
 const share=document.createElement('div');share.className='nl13-sharebar';share.id='nl13Sharebar';action.insertAdjacentElement('afterend',share);
 const overlay=document.createElement('div');overlay.id='nl13Overlay';overlay.className='nl13-overlay hidden';overlay.innerHTML='<div class="nl13-modal" role="dialog" aria-modal="true" aria-labelledby="nl13DialogTitle"><button class="nl13-close" type="button" id="nl13Close" aria-label="Закрити">×</button><div class="nl13-kicker">НОМЕРЛОВ UA</div><h2 id="nl13DialogTitle">Поділитися уловом</h2><div class="nl13-sharepreview" id="nl13Preview"></div><div class="nl13-modalactions"><button id="nl13ShareMobile" class="btn btn-primary" type="button">Надіслати картку</button><button id="nl13Download" class="btn btn-outline" type="button">Зберегти PNG</button><a id="nl13Telegram" class="btn btn-outline" target="_blank" rel="noopener noreferrer">Telegram · текст</a></div><p class="nl13-help">На Android обери Telegram у меню надсилання. Якщо це недоступно, збережи PNG.</p></div>';
 document.body.append(overlay);$('nl13Close').addEventListener('click',closeShare);overlay.addEventListener('click',e=>{if(e.target===overlay)closeShare()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.classList.contains('hidden'))closeShare()});
 $('nl13Download').addEventListener('click',downloadCard);$('nl13ShareMobile').addEventListener('click',shareCard);
}
const icon=(kind)=>`<svg class="nl13-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${kind==='share'?'<path d="M12 16V3m-5 5 5-5 5 5"/><path d="M4 14v6h16v-6"/>':kind==='gift'?'<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M3 13h18M12 9c-6 0-8-3-5-5 3-2 5 3 5 5Zm0 0c6 0 8-3 5-5-3-2-5 3-5 5Z"/>':'<path d="M4 12h16M12 4v16"/>'}</svg>`;
function renderAlbums(){const v=progress(),root=$('nl13AlbumGrid');if(!root)return;root.replaceChildren();$('nl13AlbumTotal').textContent=v.claimedAlbums.length+'/'+ALBUMS.length;
 for(const a of ALBUMS){const count=albumProgress(a,v),done=v.claimedAlbums.includes(a.id),ready=count>=a.goal;const box=document.createElement('article');box.className='nl13-album'+(done?' nl13-complete':'');box.innerHTML=`<div class="nl13-album-top"><span class="nl13-symbol">${a.icon}</span><span class="nl13-chip">${Math.min(a.goal,count)} / ${a.goal}</span></div><h3></h3><p></p><div class="nl13-track"><span style="width:${Math.min(100,Math.round(100*count/a.goal))}%"></span></div><div class="nl13-album-bottom"><span>+${fmt(a.reward)} ₴ · ${a.xp} XP</span></div>`;
 box.querySelector('h3').textContent=tr(...a.name);box.querySelector('p').textContent=tr(...a.desc);
 const b=document.createElement('button');b.type='button';b.className='btn btn-outline btn-small';b.textContent=done?tr('Отримано','Получено'):tr('Забрати','Получить');b.disabled=!ready||done;b.addEventListener('click',()=>claimAlbum(a.id));box.querySelector('.nl13-album-bottom').append(b);root.append(box);
 }
}
function renderFrames(){const v=progress(),root=$('nl13FrameGrid');if(!root)return;root.replaceChildren();for(const frame of FRAME_LIST){const unlocked=frameUnlocked(frame),selected=v.frame===frame.id;const b=document.createElement('button');b.type='button';b.className='nl13-frame-option'+(selected?' selected':'');b.disabled=!unlocked;b.innerHTML=`<span class="nl13-frame-sample nl-frame-${frame.id}"><span>AA 7777 BB</span></span><strong></strong><small></small>`;b.querySelector('strong').textContent=tr(...frame.name)+(selected?' ✓':'');b.querySelector('small').textContent=unlocked?tr('Доступно','Доступно'):tr(...frame.sub);b.addEventListener('click',()=>chooseFrame(frame.id));root.append(b)}}
function renderStreak(){const root=$('nl13Streak');if(!root)return;const v=progress(),today=api.todayKey(),days=(dateUTC(today)-dateUTC(v.streakDay))/86400000,current=(days<=1&&days>=0)?v.streak:0;const got=api.state.daily===today;root.innerHTML=`<div class="nl13-heading"><div><span class="nl13-kicker">ЩОДЕННА АКТИВНІСТЬ</span><h3>${tr('Серія входів','Серия входов')}</h3></div><div class="nl13-streak-count">${current} <small>${tr('дн.','дн.')}</small></div></div><p class="nl13-note">${got?tr('Бонус сьогодні вже отримано','Бонус сегодня уже получен'):tr('Забирай щоденний бонус, щоб продовжити серію','Забирай ежедневный бонус, чтобы продлить серию')}</p><div class="nl13-milestones">${[3,7,14,30].map(k=>`<span class="${current>=k?'reached':''}">${k} ${tr('днів','дней')}</span>`).join('')}</div><p class="nl13-fine">${tr('Нагороди за 3, 7, 14 і 30 днів · найкраща серія:','Награды за 3, 7, 14 и 30 дней · лучшая серия:')} ${v.bestStreak}</p>`}
function renderEvent(){const root=$('nl13Event');if(!root)return;const info=resetEvent(),v=progress(),event=info.kind,count=Math.min(info.kind.goal,v.eventCount);root.innerHTML=`<div class="nl13-heading"><div><span class="nl13-kicker">${tr('ТИЖНЕВА ПОДІЯ','НЕДЕЛЬНОЕ СОБЫТИЕ')}</span><h3></h3></div><span class="nl13-chip">${info.remaining} ${tr('дн.','дн.')}</span></div><p class="nl13-note"></p><div class="nl13-track"><span style="width:${Math.round(100*count/event.goal)}%"></span></div><div class="nl13-eventbottom"><span>${count}/${event.goal} · +${fmt(event.coins)} ₴ · ${event.xp} XP</span></div>`;
 root.querySelector('h3').textContent=tr(...event.name);root.querySelector('p').textContent=tr(...event.desc);const b=document.createElement('button');b.type='button';b.className='btn btn-outline btn-small';b.textContent=v.eventClaimed?tr('Нагорода отримана','Награда получена'):tr('Забрати нагороду','Забрать награду');b.disabled=v.eventClaimed||count<event.goal;b.addEventListener('click',claimEvent);root.querySelector('.nl13-eventbottom').append(b)}
function applyFrame(){const name=progress().frame;document.querySelectorAll('.plate,.mini-plate').forEach(el=>{for(const f of FRAME_LIST)el.classList.remove('nl-frame-'+f.id);el.classList.add('nl-frame-'+name)})}
function decorateGarageShare(){
 const cards=document.querySelectorAll('#collectionGrid .collection-item');
 for(const card of cards){if(card.querySelector('.nl13-garage-share'))continue;
  const plate=card.querySelector('.mini-plate');const head=plate?.querySelector('strong')?.textContent?.trim();
  const side=plate?.querySelector('.mini-ru')?.childNodes[0]?.textContent?.trim();
  const full=plate?.classList.contains('ru')?(head+' '+side):head;
  const item=api.state.collection.find(x=>x.code===full);
  const row=card.querySelector('.item-btns');if(!item||!row)continue;
  const btn=document.createElement('button');btn.type='button';btn.className='btn btn-outline btn-small nl13-garage-share';btn.textContent=tr('Поділитися','Поделиться');btn.addEventListener('click',()=>openShare(item));row.append(btn);
 }
}
function renderShareBar(){const root=$('nl13Sharebar');if(!root)return;root.replaceChildren();if(!api.state.current)return;const b=document.createElement('button');b.className='btn btn-outline nl13-sharebtn';b.type='button';b.innerHTML=icon('share')+`<span>${tr('Поділитися уловом','Поделиться находкой')}</span>`;b.addEventListener('click',()=>openShare(api.state.current));root.append(b)}
let shareItem=null,prevFocus=null;
function openShare(item){if(!item)return;shareItem={code:String(item.code),tier:String(item.tier),price:Number(item.price),region:String(item.region||'')};prevFocus=document.activeElement;const tier=(api.tiers||[]).find(x=>x.id===shareItem.tier);$('nl13DialogTitle').textContent=tr('Поділитися уловом','Поделиться находкой');$('nl13Preview').replaceChildren();const code=document.createElement('strong');code.textContent=shareItem.code;const detail=document.createElement('span');detail.textContent=`${tr(tier?.name||'Номер',tier?.name||'Номер')} · ${fmt(shareItem.price)} ₴`;const region=document.createElement('small');region.textContent=shareItem.region;$('nl13Preview').append(code,detail,region);$('nl13ShareMobile').textContent=tr('Надіслати картку','Отправить карточку');$('nl13Download').textContent=tr('Зберегти PNG','Сохранить PNG');$('nl13Telegram').textContent=tr('Telegram · текст','Telegram · текст');const url='https://nomerlov-ua.vercel.app';const txt=tr(`Мій улов у НомерЛов UA: ${shareItem.code} · ${fmt(shareItem.price)} ігрових ₴!`, `Моя находка в НомерЛов UA: ${shareItem.code} · ${fmt(shareItem.price)} игровых ₴!`);$('nl13Telegram').href='https://t.me/share/url?url='+encodeURIComponent(url)+'&text='+encodeURIComponent(txt);$('nl13Overlay').classList.remove('hidden');document.body.style.overflow='hidden';$('nl13Close').focus()}
function closeShare(){const box=$('nl13Overlay');if(!box||box.classList.contains('hidden'))return;box.classList.add('hidden');document.body.style.overflow='';shareItem=null;if(prevFocus?.isConnected)prevFocus.focus();prevFocus=null}
function drawCard(){if(!shareItem)return null;const c=document.createElement('canvas');c.width=1080;c.height=1350;const ctx=c.getContext('2d');if(!ctx)return null;const g=ctx.createLinearGradient(0,0,1080,1350);g.addColorStop(0,'#171025');g.addColorStop(.55,'#121527');g.addColorStop(1,'#070b15');ctx.fillStyle=g;ctx.fillRect(0,0,1080,1350);ctx.strokeStyle='#7543b4';ctx.lineWidth=5;ctx.strokeRect(30,30,1020,1290);ctx.fillStyle='#c99bff';ctx.font='bold 33px system-ui';ctx.fillText('НОМЕРЛОВ UA',92,118);ctx.fillStyle='#fff';ctx.font='bold 69px system-ui';ctx.fillText(tr('МІЙ УЛОВ','МОЯ НАХОДКА'),92,238);const rarity=api.tiers?.find(t=>t.id===shareItem.tier);ctx.fillStyle=rarity?.color||'#d6a3ff';ctx.font='bold 42px system-ui';ctx.fillText(rarity?.name?.toUpperCase()||'',92,326);
ctx.shadowBlur=37;ctx.shadowColor='#9863ec';ctx.fillStyle='#f6f7fb';ctx.fillRect(85,422,910,252);ctx.shadowBlur=0;ctx.strokeStyle='#51515c';ctx.lineWidth=10;ctx.strokeRect(85,422,910,252);const parts=shareItem.code.split(' '),other=/\d{3}[АВЕКМНОРСТУХ]{2} \d{2,3}$/.test(shareItem.code);ctx.fillStyle='#17202c';if(other){ctx.font='bold 83px system-ui';ctx.fillText(parts[0],115,571);ctx.beginPath();ctx.moveTo(806,430);ctx.lineTo(806,665);ctx.stroke();ctx.font='bold 73px system-ui';ctx.fillText(parts[1]||'',827,551);ctx.font='bold 23px system-ui';ctx.fillText('REG',835,604)}else{ctx.fillStyle='#0d4c99';ctx.fillRect(97,435,88,225);ctx.fillStyle='#f8fbff';ctx.font='bold 30px system-ui';ctx.fillText('UA',121,620);ctx.fillStyle='#17202c';ctx.font='bold 78px system-ui';ctx.fillText(shareItem.code,211,567)}
ctx.fillStyle='#e7d1ff';ctx.font='bold 39px system-ui';ctx.fillText(tr('ІГРОВА ВАРТІСТЬ','ИГРОВАЯ СТОИМОСТЬ'),92,780);ctx.fillStyle='#fff';ctx.font='bold 93px system-ui';ctx.fillText(fmt(shareItem.price)+' ₴',92,890);ctx.fillStyle='#b9b6ca';ctx.font='32px system-ui';ctx.fillText(shareItem.region.slice(0,48),92,979);ctx.fillStyle='#9ca7c0';ctx.font='30px system-ui';ctx.fillText('nomerlov-ua.vercel.app',92,1225);return c}
function filePNG(canvas){const b64=canvas.toDataURL('image/png').split(',')[1];const abc='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';const bytes=[];let buf=0,bits=0;for(const ch of b64){if(ch==='=')break;const n=abc.indexOf(ch);if(n<0)continue;buf=(buf<<6)|n;bits+=6;if(bits>=8){bits-=8;bytes.push((buf>>bits)&255)}}return new File([new Uint8Array(bytes)],'nomerlov-'+shareItem.code.replace(/\s+/g,'-')+'.png',{type:'image/png'})}
function downloadCard(){const c=drawCard();if(!c)return;const a=document.createElement('a');a.download='nomerlov-'+shareItem.code.replace(/\s+/g,'-')+'.png';a.href=c.toDataURL('image/png');document.body.append(a);a.click();a.remove()}
function shareCard(){const canvas=drawCard();if(!canvas)return;const file=filePNG(canvas);if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:'НомерЛов UA',text:tr('Моя знахідка у НомерЛов UA','Моя находка в НомерЛов UA')}).catch(err=>{if(err?.name!=='AbortError')notify(tr('Не вдалося надіслати','Не удалось отправить'),tr('Збережи PNG та прикріпи його в Telegram','Сохрани PNG и прикрепи его в Telegram'))});return}downloadCard();notify(tr('Картку збережено','Карточка сохранена'),tr('Прикріпи PNG до повідомлення в Telegram','Прикрепи PNG к сообщению в Telegram'))}
function render(){if(!$('nl13Album'))attachRoot();if(!$('nl13Album'))return;progress();renderAlbums();renderFrames();renderStreak();renderEvent();renderShareBar();decorateGarageShare();applyFrame()}
function initialize(){attachRoot();migrate();render();window.addEventListener('nomerlov:v13render',render);window.addEventListener('nomerlov:v13catch',e=>{addCatch(e.detail||{});});window.addEventListener('nomerlov:v13daily',e=>{streakClaim(e.detail?.day||api.todayKey());});
 $('collectionGrid')?.addEventListener('click',()=>{setTimeout(decorateGarageShare,0)});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
