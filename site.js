(function(){
  // ---------- basics (work without animation) ----------
  // phone menu
  var mb=document.getElementById('menubtn'),sheet=document.getElementById('msheet');
  function setSheet(o){if(!sheet)return;sheet.hidden=!o;mb.setAttribute('aria-expanded',o);mb.textContent=o?'Close':'Menu';document.documentElement.classList.toggle('menu-open',o);}
  if(mb&&sheet){mb.addEventListener('click',function(){setSheet(sheet.hidden);});
    sheet.addEventListener('click',function(e){if(e.target.closest('a'))setSheet(false);});}

  // desktop dropdowns
  var dds=[].slice.call(document.querySelectorAll('[data-dd]')),fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches,closeT;
  function setDD(btn,o){var li=btn.parentElement;if(o){dds.forEach(function(b){if(b!==btn)setDD(b,false);});li.setAttribute('data-open','');}else li.removeAttribute('data-open');btn.setAttribute('aria-expanded',o);}
  function anyOpen(){return dds.some(function(b){return b.getAttribute('aria-expanded')==='true';})||(sheet&&!sheet.hidden);}
  dds.forEach(function(btn){
    var li=btn.parentElement,panel=document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click',function(){setDD(btn,btn.getAttribute('aria-expanded')!=='true');});
    btn.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){e.preventDefault();setDD(btn,true);var f=panel.querySelector('a');if(f)f.focus();}});
    if(fine){li.addEventListener('mouseenter',function(){clearTimeout(closeT);setDD(btn,true);});
             li.addEventListener('mouseleave',function(){closeT=setTimeout(function(){setDD(btn,false);},140);});}
    li.addEventListener('focusout',function(e){if(!li.contains(e.relatedTarget))setDD(btn,false);});
  });
  document.addEventListener('click',function(e){if(!e.target.closest('.nav-links'))dds.forEach(function(b){setDD(b,false);});});
  document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;
    var open=dds.filter(function(b){return b.getAttribute('aria-expanded')==='true';})[0];
    if(open){setDD(open,false);open.focus();}else if(sheet&&!sheet.hidden){setSheet(false);mb.focus();}});
  window.addEventListener('resize',function(){if(sheet&&!sheet.hidden&&innerWidth>1080)setSheet(false);});

  document.querySelectorAll('[data-interest]').forEach(function(a){a.addEventListener('click',function(){try{localStorage.setItem('sries-interest',a.getAttribute('data-interest'));}catch(e){}});});
  var sel=document.getElementById('f-int');
  if(sel){var v=null;try{v=localStorage.getItem('sries-interest');localStorage.removeItem('sries-interest');}catch(e){}
    if(v)[].forEach.call(sel.options,function(o){if(o.text===v)sel.value=v;});}

  var form=document.getElementById('contactform');
  if(form)form.addEventListener('submit',function(e){e.preventDefault();var n=document.getElementById('formnote'),nm=document.getElementById('f-name'),em=document.getElementById('f-email');
    if(!nm.value.trim()){n.textContent='Please add your name.';nm.focus();return;}
    if(!em.value.trim()||!em.checkValidity()){n.textContent='Please add a valid email address.';em.focus();return;}
    n.textContent='This form is not connected yet, so nothing was sent.';});

  // carousels: arrow buttons scroll the nearest carousel
  document.querySelectorAll('[data-car-prev],[data-car-next]').forEach(function(b){
    b.addEventListener('click',function(){
      var sec=b.closest('section'),car=sec&&sec.querySelector('[data-car]');if(!car)return;
      var card=car.firstElementChild,step=card?card.getBoundingClientRect().width+16:car.clientWidth*.8;
      car.scrollBy({left:b.hasAttribute('data-car-next')?step:-step,behavior:'smooth'});
    });
  });

  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href^="#"]');if(!a||a.getAttribute('href').length<2)return;
    var t=document.getElementById(a.getAttribute('href').slice(1));if(!t)return;
    e.preventDefault();t.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  });

  var hasG=typeof window.gsap!=='undefined'&&typeof window.ScrollTrigger!=='undefined';
  var calm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motion=hasG&&!calm;

  // dark tabbed panels (click or arrow keys; with motion on they also step through as you scroll)
  var SYSTEMS=[];
  document.querySelectorAll('[data-system]').forEach(function(sys){
    var bs=[].slice.call(sys.querySelectorAll('[role=tab]')),ims=[].slice.call(sys.querySelectorAll('.sys-img img')),
        pns=bs.map(function(x){return document.getElementById(x.getAttribute('aria-controls'));}),cur=sys.querySelector('[data-cur]'),idx=0;
    var o={el:sys,n:bs.length,st:null};
    o.set=function(i){
      if(i===idx)return;idx=i;
      bs.forEach(function(x,j){var on=j===i;x.setAttribute('aria-selected',on?'true':'false');x.tabIndex=on?0:-1;if(!on)x.style.setProperty('--p',0);});
      pns.forEach(function(pn,j){var on=j===i;pn.classList.toggle('on',on);if(on){pn.removeAttribute('aria-hidden');pn.removeAttribute('inert');}else{pn.setAttribute('aria-hidden','true');pn.setAttribute('inert','');}});
      ims.forEach(function(im,j){im.classList.toggle('on',j===i);if(j===i&&im.loading==='lazy')im.loading='eager';});
      if(cur)cur.textContent=(i<9?'0':'')+(i+1);
      var tb=bs[i];if(tb.parentElement.scrollWidth>tb.parentElement.clientWidth)tb.parentElement.scrollTo({left:tb.offsetLeft-16,behavior:'smooth'});
    };
    o.bar=function(f){bs[idx].style.setProperty('--p',Math.max(0,Math.min(1,f)).toFixed(3));};
    o.go=function(i){
      if(o.st){var st=o.st;window.scrollTo({top:st.start+(i+.35)/o.n*(st.end-st.start),behavior:calm?'auto':'smooth'});}
      else o.set(i);
    };
    // preload the panel images so the crossfade never shows a blank frame
    ims.forEach(function(im){im.loading='eager';});
    bs.forEach(function(x,i){
      x.addEventListener('click',function(){o.go(i);});
      x.addEventListener('keydown',function(e){var j=e.key==='ArrowDown'||e.key==='ArrowRight'?i+1:e.key==='ArrowUp'||e.key==='ArrowLeft'?i-1:null;if(j===null)return;e.preventDefault();j=(j+bs.length)%bs.length;bs[j].focus();o.go(j);});
    });
    SYSTEMS.push(o);
  });

  if(!motion)return;

  // ---------- Reforma-style motion ----------
  gsap.registerPlugin(ScrollTrigger);
  var hasSplit=!!window.SplitText;if(hasSplit)gsap.registerPlugin(SplitText);
  document.documentElement.classList.add('anim');
  var EASE='power3.out';

  var nav=document.querySelector('.nav');
  if(nav)ScrollTrigger.create({start:0,end:'max',onUpdate:function(self){
    if(anyOpen())return;
    nav.classList.toggle('hide',self.direction===1&&self.scroll()>160);}});

  // remove a finished scroll sequence while keeping what's on screen exactly where it is
  var REARM=[];
  function release(st,anchor,cleanup){
    if(!st)return;var before=anchor?anchor.getBoundingClientRect().top:0;
    st.kill(true);if(cleanup)cleanup();
    var after=anchor?anchor.getBoundingClientRect().top:0;
    if(Math.abs(after-before)>1)window.scrollTo(0,window.scrollY+(after-before));
    ScrollTrigger.refresh();
  }

  function start(){
    // hero: words fade in, then the centre image grows to fill the screen
    var hx=document.getElementById('hx');
    if(hx){
      var stage=hx.querySelector('.hx-stage'),fill=hx.querySelector('.hx-fill'),origin=hx.querySelector('[data-origin]'),
          head=hx.querySelector('.hx-head'),row=hx.querySelector('.hx-row'),sides=hx.querySelectorAll('.hx-row figure:not([data-origin])'),
          shade=hx.querySelector('.hx-shade'),lines=hx.querySelectorAll('.hx-lines p'),h1=hx.querySelector('h1');
      var R=function(){var x=0,y=0,e=origin;while(e&&e!==stage){x+=e.offsetLeft;y+=e.offsetTop;e=e.offsetParent;}return{l:x,t:y,w:origin.offsetWidth,h:origin.offsetHeight};};
      if(hasSplit){var sp=SplitText.create(h1,{type:'words'});h1._words=sp.words;gsap.fromTo(sp.words,{opacity:.12},{opacity:1,duration:.9,ease:'power2.out',stagger:.14,delay:.15});}
      gsap.from([row,fill],{y:90,opacity:0,duration:1.3,ease:'power4.out',delay:.25,clearProps:'transform'});
      var heroTargets=[head,row,fill,fill.querySelector('img'),shade].concat([].slice.call(sides)).concat([].slice.call(lines));
      var heroScroll=function(){
      var tl=gsap.timeline({scrollTrigger:{trigger:hx,start:'top top',end:'bottom bottom',scrub:.8,invalidateOnRefresh:true}});
      // once the hero is completely off screen, settle it into its normal layout so scrolling back up is quick
      ScrollTrigger.create({trigger:hx,start:'top top',end:'bottom top',onLeave:function(self){
        requestAnimationFrame(function(){release(self,hx.nextElementSibling,function(){
          if(tl.scrollTrigger)tl.scrollTrigger.kill();tl.kill();gsap.set(heroTargets,{clearProps:'all'});
          document.documentElement.classList.add('hx-done');
          REARM.push(function(){
            // back at the top: bring the scroll animation back for the next pass down
            document.documentElement.classList.remove('hx-done');heroScroll();
            if(hasSplit&&h1._words)gsap.fromTo(h1._words,{opacity:.12},{opacity:1,duration:.8,ease:'power2.out',stagger:.12});
          });});});
      }});
      tl.to(head,{y:-90,opacity:0,duration:.2,ease:'none'},0)
        .to(sides,{opacity:0,y:40,duration:.22,stagger:{each:.025,from:'center'},ease:'none'},0)
        .fromTo(fill,{left:function(){return R().l;},top:function(){return R().t;},width:function(){return R().w;},height:function(){return R().h;},borderRadius:20},
                     {left:0,top:0,width:function(){return stage.clientWidth;},height:function(){return stage.clientHeight;},borderRadius:0,duration:.34,ease:'power2.inOut'},.1)
        .fromTo(fill.querySelector('img'),{scale:1.25},{scale:1,duration:.34,ease:'power2.inOut'},.1)
        .to(shade,{opacity:1,duration:.14,ease:'none'},.34)
        .fromTo(lines[0],{opacity:0,y:50},{opacity:1,y:0,duration:.1,ease:'power2.out'},.46)
        .to(lines[0],{opacity:0,y:-50,duration:.09,ease:'power2.in'},.66)
        .fromTo(lines[1],{opacity:0,y:50},{opacity:1,y:0,duration:.1,ease:'power2.out'},.76)
        .to({},{duration:.14});
      };
      heroScroll();
    }

    if(hasSplit){
      // headings rise line by line
      document.querySelectorAll('main h1, main h2').forEach(function(h){
        if(h.closest('#hx')||h.hasAttribute('data-words'))return;
        SplitText.create(h,{type:'lines',mask:'lines',linesClass:'split-line',autoSplit:true,onSplit:function(self){
          return gsap.from(self.lines,{yPercent:110,duration:1.05,ease:'power4.out',stagger:.09,scrollTrigger:{trigger:h,start:'top 88%',once:true}});}});
      });
      // statements light up word by word with the scroll
      document.querySelectorAll('[data-words]').forEach(function(h){
        SplitText.create(h,{type:'words',autoSplit:true,onSplit:function(self){
          return gsap.fromTo(self.words,{opacity:.14},{opacity:1,ease:'none',stagger:.1,scrollTrigger:{trigger:h,start:'top 85%',end:'bottom 45%',scrub:true}});}});
      });
    }

    // blocks fade up in small groups
    var q=['.ph .sub','.ph .actions','.head .eb','.head > p','.head > .actions','.head-c .eb','.head-c p','.head-c .actions','.ccard','.box','.pkg','.ncard','.wcard','.stat','.tile',
           '.person','.loc','.ct-card','.cs','.cs-meta > div','.cs-fig','.cs-q','.lab > *','.faq details','.spec','.checks li','.how .l > div:last-child','.prose > *','.toc','form','.fgrid > *','.appr .l > div','.ov-card','.statement > :not([data-words])','.vt .eb','.vt .actions','.cta .actions'].join(',');
    var items=[].slice.call(document.querySelectorAll(q)).filter(function(el){return !el.closest('#hx');});
    gsap.set(items,{opacity:0,y:40});
    ScrollTrigger.batch(items,{start:'top 92%',once:true,onEnter:function(batch){gsap.to(batch,{opacity:1,y:0,duration:1.05,ease:EASE,stagger:.08,overwrite:true,clearProps:'transform'});}});

    // stacked feature cards rise into place
    document.querySelectorAll('.feat').forEach(function(f){
      gsap.from(f,{y:80,opacity:0,duration:1.1,ease:EASE,scrollTrigger:{trigger:f,start:'top 92%',once:true},clearProps:'transform'});
    });

    // figures count up
    document.querySelectorAll('[data-count]').forEach(function(el){
      var to=+el.dataset.count,pre=el.dataset.prefix||'',o={v:0};el.textContent=pre+'0';
      gsap.to(o,{v:to,duration:1.8,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 92%',once:true},onUpdate:function(){el.textContent=pre+Math.round(o.v);}});
    });

    // slow parallax inside image frames
    document.querySelectorAll('.cs-fig img, .feat .img img, .ph-img img, .ov-img img, .cta > img, .vt > img, .how .img img, .ac img, .stat.img > img').forEach(function(im){
      gsap.fromTo(im,{yPercent:-6,scale:1.14},{yPercent:6,scale:1.14,ease:'none',scrollTrigger:{trigger:im.parentElement,start:'top bottom',end:'bottom top',scrub:true}});
    });

    // image CTA and full-bleed image open up as they arrive
    document.querySelectorAll('.cta').forEach(function(c){
      gsap.fromTo(c,{clipPath:'inset(8% 5% 8% 5% round 20px)'},{clipPath:'inset(0% 0% 0% 0% round 20px)',ease:'none',scrollTrigger:{trigger:c,start:'top 95%',end:'top 35%',scrub:true}});
    });
    document.querySelectorAll('.ov-img').forEach(function(c){
      gsap.fromTo(c,{clipPath:'inset(0% 4% 0% 4% round 20px)'},{clipPath:'inset(0% 0% 0% 0% round 0px)',ease:'none',scrollTrigger:{trigger:c,start:'top 90%',end:'top 20%',scrub:true}});
    });

    // tabbed panels lock in place and step through each tab before the page moves on
    var arm=function(o){
      var sys=o.el,box=sys.parentElement;
      // keep the section heading in view too when it fits alongside the panel
      var tgt=(box&&box.classList.contains('wrap')&&box.offsetHeight<=innerHeight-96)?box:sys;
      if(tgt===box)box.classList.add('sys-pin');
      var top=function(){return Math.max(80,(innerHeight-tgt.offsetHeight)/2+20);};
      if(tgt.offsetHeight>innerHeight-96)return;
      o.st=ScrollTrigger.create({trigger:tgt,start:function(){return 'top '+top()+'px';},end:function(){return '+='+Math.round(o.n*innerHeight*.4);},
        pin:true,pinSpacing:true,anticipatePin:1,invalidateOnRefresh:true,
        onUpdate:function(self){var p=self.progress*o.n,i=Math.min(o.n-1,Math.floor(p));o.set(i);o.bar(self.progress>=1?1:p-i);},
        onToggle:function(self){sys.classList.toggle('pinned',self.isActive);},
        onLeave:function(self){
          // every tab seen: unlock so the page scrolls freely in both directions from now on
          o.set(o.n-1);o.bar(1);
          requestAnimationFrame(function(){release(self,tgt.closest('section').nextElementSibling,function(){o.st=null;sys.classList.remove('pinned');
            REARM.push(function(){o.set(0);o.bar(0);arm(o);});});});
        }});
    };
    SYSTEMS.forEach(arm);

    // when the visitor comes back to the top of the page, set the scroll sequences up again
    // (only after the visitor has really scrolled away, so the page never resets itself mid-scroll)
    // ScrollTrigger briefly scrolls to the top while it re-measures, so ignore scroll events during a refresh
    var away=false,measuring=false,pending=null;
    ScrollTrigger.addEventListener('refreshInit',function(){measuring=true;});
    ScrollTrigger.addEventListener('refresh',function(){setTimeout(function(){measuring=false;},0);});
    window.addEventListener('scroll',function(){
      if(measuring||!REARM.length){if(!REARM.length)away=false;return;}
      var y=window.scrollY;
      if(y>innerHeight*.5)away=true;
      if(away&&y<=4){
        clearTimeout(pending);
        pending=setTimeout(function(){
          if(measuring||window.scrollY>4)return;      // still really at the top?
          away=false;var fns=REARM.splice(0);fns.forEach(function(f){f();});
          if(ScrollTrigger.sort)ScrollTrigger.sort();ScrollTrigger.refresh();
        },150);
      }
    },{passive:true});

    if(ScrollTrigger.sort)ScrollTrigger.sort();
    ScrollTrigger.refresh();
    setTimeout(function(){ScrollTrigger.refresh();},600);
  }
  window.addEventListener('load',function(){ScrollTrigger.refresh();});
  // keep pinned sections and scroll effects lined up when late fonts or images change the page height
  var lastH=0,rt;
  function relayout(){clearTimeout(rt);rt=setTimeout(function(){var h=document.documentElement.scrollHeight;if(Math.abs(h-lastH)>1){ScrollTrigger.refresh();lastH=document.documentElement.scrollHeight;}},120);}
  if('ResizeObserver'in window){var ro=new ResizeObserver(relayout);ro.observe(document.querySelector('main')||document.body);}
  if(document.fonts&&document.fonts.addEventListener)document.fonts.addEventListener('loadingdone',relayout);
  document.querySelectorAll('img').forEach(function(im){if(!im.complete)im.addEventListener('load',relayout,{once:true});});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(start);else start();
})();
