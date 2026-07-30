/* 4 Meaning · comportamiento compartido: nav, reveals, parallax */
(function(){
  var nav=document.getElementById('nav');
  if(nav){
    var onScroll=function(){nav.classList.toggle('scrolled',window.scrollY>40);};
    onScroll();window.addEventListener('scroll',onScroll,{passive:true});
  }

  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('vis');io.unobserve(e.target);}});
  },{threshold:.14,rootMargin:'0px 0px -50px 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});

  var reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var px=[].slice.call(document.querySelectorAll('[data-parallax]'));
  if(!reduce&&px.length){
    var ticking=false;
    var frame=function(){
      px.forEach(function(el){
        var host=el.parentElement.getBoundingClientRect();
        var speed=parseFloat(el.getAttribute('data-parallax'))||.15;
        var off=(host.top+host.height/2-window.innerHeight/2)*-speed;
        el.style.transform='translate3d(0,'+off.toFixed(1)+'px,0)';
      });
      ticking=false;
    };
    window.addEventListener('scroll',function(){if(!ticking){requestAnimationFrame(frame);ticking=true;}},{passive:true});
    frame();
  }
})();
