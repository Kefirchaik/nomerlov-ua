/* НомерЛов UA v1.5.1 — APK-oriented shell. Never changes the game save key. */
(()=>{
'use strict';
const APP_VERSION='1.5.1';
const nativeMode=location.protocol==='file:'||new URLSearchParams(location.search).get('apk')==='1'||/\bwv\b/i.test(navigator.userAgent);
document.documentElement.classList.add('nomerlov-v15');
if(nativeMode)document.documentElement.classList.add('apk-native');
const $=id=>document.getElementById(id);
const tr=(uk,ru)=>window.NOMERLOV_APP?.state?.lang==='ru'?ru:uk;
const haptic=(pattern)=>{try{if(navigator.vibrate)navigator.vibrate(pattern)}catch{}};
const currentTab=()=>document.querySelector('.view.active')?.id?.replace('view-','')||'hunt';
const goHome=()=>document.querySelector('.bottom-nav [data-nav="hunt"]')?.click();
let menu=null,menuBtn=null,previousFocus=null,restoreOverflow='',backGuard=false;
function updateMenu(){
 if(!menu)return;
 const ru=window.NOMERLOV_APP?.state?.lang==='ru';
 menu.querySelector('#apkMenuTitle').textContent=tr('НомерЛов UA','НомерЛов UA');
 menu.querySelector('#apkMenuSubtitle').textContent=tr('Параметри гри · v'+APP_VERSION,'Настройки игры · v'+APP_VERSION);
 menu.querySelector('#apkLanguageTitle').textContent=tr('Мова інтерфейсу','Язык интерфейса');
 menu.querySelector('#apkProgressTitle').textContent=tr('Збереження прогресу','Сохранение прогресса');
 menu.querySelector('[data-apk-action="export"]').textContent=tr('↧ Експорт','↧ Экспорт');
 menu.querySelector('[data-apk-action="import"]').textContent=tr('↥ Імпорт','↥ Импорт');
 menu.querySelector('#apkSupportLink').textContent=tr('♡ Підтримати автора','♡ Поддержать автора');
 menu.querySelector('#apkMenuInfo').textContent=tr('Прогрес зберігається на цьому пристрої. Перед перевстановленням APK зроби експорт.','Прогресс хранится на этом устройстве. Перед переустановкой APK сделай экспорт.');
 menu.querySelector('[data-apk-action="uk"]').classList.toggle('is-selected',!ru);
 menu.querySelector('[data-apk-action="ru"]').classList.toggle('is-selected',!!ru);
}
function closeMenu(){
 if(!menu||menu.hidden)return false;
 menu.hidden=true;document.body.style.overflow=restoreOverflow;
 menuBtn?.setAttribute('aria-expanded','false');
 if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
 previousFocus=null;
 return true;
}
function openMenu(){
 if(!menu)return;
 previousFocus=document.activeElement;restoreOverflow=document.body.style.overflow;
 updateMenu();menu.hidden=false;document.body.style.overflow='hidden';
 menuBtn.setAttribute('aria-expanded','true');menu.querySelector('.apk-close').focus({preventScroll:true});
 haptic(12);
}
function setupMenu(){
 const right=document.querySelector('.header-right');
 if(!right||$('apkMenuBtn'))return;
 menuBtn=document.createElement('button');menuBtn.type='button';menuBtn.id='apkMenuBtn';
 menuBtn.setAttribute('aria-label',tr('Відкрити меню гри','Открыть меню игры'));
 menuBtn.setAttribute('aria-expanded','false');menuBtn.setAttribute('aria-controls','apkMenu');
 menuBtn.textContent='⋯';right.append(menuBtn);
 menu=document.createElement('div');menu.id='apkMenu';menu.className='apk-overlay';menu.hidden=true;
 menu.innerHTML=`<section class="apk-drawer" role="dialog" aria-modal="true" aria-labelledby="apkMenuTitle">
 <div class="apk-grip" aria-hidden="true"></div><div class="apk-drawer-head"><div><h2 id="apkMenuTitle"></h2><p id="apkMenuSubtitle"></p></div><button type="button" class="apk-close" aria-label="Закрити / Закрыть" data-apk-action="close">×</button></div>
 <p class="apk-setting-label" id="apkLanguageTitle"></p><div class="apk-language-row"><button type="button" class="apk-drawer-btn" data-apk-action="uk">🇺🇦 УКР</button><button type="button" class="apk-drawer-btn" data-apk-action="ru">РУС</button></div>
 <p class="apk-setting-label" id="apkProgressTitle"></p><div class="apk-actions"><button type="button" class="apk-drawer-btn" data-apk-action="export"></button><button type="button" class="apk-drawer-btn" data-apk-action="import"></button></div>
 <a id="apkSupportLink" class="apk-drawer-link" target="_blank" rel="noopener noreferrer" href="https://send.monobank.ua/jar/SDWp3ABSr"></a><p id="apkMenuInfo" class="apk-drawer-info"></p></section>`;
 document.body.append(menu);updateMenu();
 menuBtn.addEventListener('click',()=>menu.hidden?openMenu():closeMenu());
 menu.addEventListener('click',event=>{
  if(event.target===menu){closeMenu();return}
  const action=event.target.closest('[data-apk-action]')?.dataset.apkAction;
  if(!action)return;
  if(action==='close'){closeMenu();return}
  if(action==='uk'||action==='ru'){
    closeMenu();$(action==='uk'?'langUk':'langRu')?.click();
    menuBtn.setAttribute('aria-label',tr('Відкрити меню гри','Открыть меню игры'));
  }else if(action==='export'||action==='import'){
    closeMenu();$(action==='export'?'exportBtn':'importBtn')?.click();
  }
 });
 document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});
}
function closeExistingOverlay(){
 if(closeMenu())return true;
 const choice=$('choiceBackdrop');
 if(choice&&!choice.classList.contains('hidden')){$('choiceClose')?.click();return true}
 const modal=$('modalBackdrop');
 if(modal&&!modal.classList.contains('hidden')){$('modalCancel')?.click();return true}
 const other=document.querySelector('.nl13-modal:not(.hidden),.nl13-overlay:not(.hidden)');
 if(other){const close=other.querySelector('[aria-label*="Закр"],[aria-label*="Закры"],.nl13-close');if(close){close.click();return true}}
 return false;
}
function setupAndroidBack(){
 // In an Android WebView with back-history enabled, reserve one same-URL entry.
 // Let the outer WebView handle exit when already on the home tab.
 if(!nativeMode||!history.pushState)return;
 try{history.replaceState({nlAppBase:true},'',location.href);history.pushState({nlAppGuard:true},'',location.href);backGuard=true}catch{return}
 window.addEventListener('popstate',()=>{
   backGuard=false;
   const handled=closeExistingOverlay()||(currentTab()!=='hunt'&&(goHome(),true));
   if(handled){try{history.pushState({nlAppGuard:true},'',location.href);backGuard=true}catch{}}
 });
}
function setupHaptics(){
 document.addEventListener('click',e=>{
  const b=e.target.closest('button,.apk-drawer-link');
  if(b&&!b.disabled&&!b.closest('.apk-overlay'))haptic(8);
 },{passive:true});
 window.addEventListener('nomerlov:v13catch',event=>{
  const tier=event.detail?.tier;
  if(tier==='mythic')haptic([45,50,95,65,135]);
  else if(tier==='legendary')haptic([32,38,75]);
  else if(tier==='epic')haptic([28,25,35]);
 });
}
function showSplash(){
 if(!nativeMode)return;
 try{if(sessionStorage.getItem('nomerlov-v15-splash'))return;sessionStorage.setItem('nomerlov-v15-splash','1')}catch{}
 const splash=document.createElement('div');splash.className='apk-splash';splash.setAttribute('aria-label',tr('Запуск НомерЛов UA','Запуск НомерЛов UA'));
 splash.innerHTML=`<div class="apk-splash-inner"><div class="apk-splash-mark"><svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="7" y="17" width="50" height="30" rx="8" stroke="white" stroke-width="4"/><rect x="13" y="23" width="11" height="18" rx="3" fill="#f2c24b"/><path d="M29 25h21M29 32h21M29 39h13" stroke="white" stroke-linecap="round" stroke-width="4"/></svg></div><strong>НОМЕРЛОВ <span>UA</span></strong><p>${tr('Лови · Збирай · Перемагай','Лови · Собирай · Побеждай')}</p><div class="apk-splash-line"></div></div>`;
 document.body.append(splash);
 const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 window.setTimeout(()=>splash.classList.add('is-done'),reduce?200:850);
 window.setTimeout(()=>splash.remove(),reduce?450:1300);
}
function initialize(){
 setupMenu();setupHaptics();setupAndroidBack();showSplash();
 // Visibility change refreshes the latest language if changed from another tab.
 window.addEventListener('nomerlov:v13render',()=>{if(menu&&!menu.hidden)updateMenu()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
