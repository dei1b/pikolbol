(() => {
 const categories=[['controls','Controls'],['keyboard','Keyboard'],['audio','Audio'],['display','Display'],['progress','Progress']],key='rally.offline.settings.category.v1';
 function initial(hasProgress){try{const id=localStorage.getItem(key);if(categories.some(([value])=>value===id)&&(hasProgress||id!=='progress'))return id;}catch{}return'controls';}
 function changed(event,id){try{localStorage.setItem(key,id);}catch{}let node=event.currentTarget.closest('[data-settings]');while(node){const overflow=getComputedStyle(node).overflowY;if((overflow==='auto'||overflow==='scroll')&&node.scrollHeight>node.clientHeight){node.scrollTop=0;break;}node=node.parentElement;}}
 function keyboard(event){if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;const buttons=[...event.currentTarget.querySelectorAll('[role=tab]')],index=buttons.indexOf(document.activeElement);if(index<0)return;event.preventDefault();event.stopPropagation();const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].focus();buttons[next].click();}
 globalThis.RallySettings={categories,initial,changed,keyboard};
})();
