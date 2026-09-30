(() => {
  'use strict';
  if (!window.HTMLDialogElement || !HTMLDialogElement.prototype.showModal) return;
  const groups = [];
  let group = null;
  document.querySelectorAll('h4, .gallery').forEach(node => {
    if (node.matches('h4')) {
      group = { title: node.textContent.trim(), items: [] };
      groups.push(group);
      return;
    }
    const link = node.querySelector('a[href]');
    const thumb = link?.querySelector('img');
    if (!thumb || !/\.(pdf|jpe?g|png|webp|gif)(?:[?#]|$)/i.test(link.href)) return;
    if (!group) { group = { title: 'Imágenes', items: [] }; groups.push(group); }
    const item = { link, thumb, pdf: /\.pdf(?:[?#]|$)/i.test(link.href), caption: node.querySelector('.desc')?.textContent.trim() || thumb.alt || group.title };
    group.items.push(item);
    thumb.loading = 'lazy';
    thumb.decoding = 'async';
  });
  // Decide after collecting the whole section: mixed sections retain PDFs.
  groups.filter(g => g.items.some(item => !item.pdf)).forEach(currentGroup => {
    currentGroup.items.forEach((item, index) => {
      item.link.setAttribute('aria-haspopup', 'dialog');
      item.link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault(); open(currentGroup, index);
      });
    });
  });
  if (!groups.some(g => g.items.length)) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'project-lightbox';
  dialog.setAttribute('aria-label', 'Galería del proyecto');
  dialog.innerHTML = `<div class="lightbox-toolbar"><span class="lightbox-count" aria-live="polite"></span><div class="lightbox-actions"><button type="button" data-action="zoom" aria-label="Ampliar imagen" aria-pressed="false">Zoom +</button><a class="lightbox-original" target="_blank" rel="noopener noreferrer">Abrir original</a><button type="button" data-action="close" aria-label="Cerrar galería">✕</button></div></div><div class="lightbox-stage"><img class="lightbox-image" alt=""><p class="lightbox-status" role="status"></p></div><button class="lightbox-prev" type="button" aria-label="Imagen anterior">‹</button><button class="lightbox-next" type="button" aria-label="Imagen siguiente">›</button><div class="lightbox-footer"><p class="lightbox-caption"></p><small class="lightbox-help">Desliza o usa ← → para navegar · Esc para cerrar</small></div>`;
  document.body.append(dialog);
  const $ = s => dialog.querySelector(s);
  const stage = $('.lightbox-stage'), picture = $('.lightbox-image'), status = $('.lightbox-status');
  const zoom = $('[data-action="zoom"]'), original = $('.lightbox-original');
  let active, position = 0, trigger, overflow, expanded = false, start;
  function setZoom(value) {
    expanded = value;
    dialog.classList.toggle('is-zoomed', value);
    zoom.setAttribute('aria-pressed', String(value));
    zoom.setAttribute('aria-label', value ? 'Ajustar imagen' : 'Ampliar imagen');
    zoom.textContent = value ? 'Ajustar' : 'Zoom +';
    stage.scrollTop = stage.scrollLeft = 0;
  }
  function show() {
    setZoom(false);
    const item = active.items[position];
    original.href = item.link.href;
    original.textContent = item.pdf ? 'Abrir PDF' : 'Abrir original';
    zoom.hidden = item.pdf; zoom.disabled = item.pdf;
    $('.lightbox-caption').textContent = item.caption;
    $('.lightbox-count').textContent = `${active.title} · ${position + 1} / ${active.items.length}`;
    $('.lightbox-help').textContent = item.pdf ? 'Vista previa · Abre el PDF para ver los detalles' : 'Desliza o usa ← → para navegar · Esc para cerrar';
    $('.lightbox-prev').hidden = $('.lightbox-next').hidden = active.items.length < 2;
    status.textContent = 'Cargando…'; picture.hidden = true;
    picture.alt = item.thumb.alt || item.caption;
    picture.onload = () => { picture.hidden = false; status.textContent = ''; };
    picture.onerror = () => { picture.hidden = true; status.textContent = 'No se pudo cargar la imagen. Puedes abrir el archivo con el enlace superior.'; };
    picture.src = item.pdf ? item.thumb.src : item.link.href;
  }
  function open(g, i) {
    active = g; position = i; trigger = document.activeElement;
    overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    show(); dialog.showModal(); $('[data-action="close"]').focus();
  }
  function move(delta) { position = (position + delta + active.items.length) % active.items.length; show(); }
  $('[data-action="close"]').onclick = () => dialog.close();
  $('.lightbox-prev').onclick = () => move(-1);
  $('.lightbox-next').onclick = () => move(1);
  zoom.onclick = () => setZoom(!expanded);
  picture.ondblclick = () => { if (!active.items[position].pdf) setZoom(!expanded); };
  dialog.addEventListener('close', () => { document.body.style.overflow = overflow; setZoom(false); trigger?.focus({ preventScroll: true }); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      if (expanded) return;
      event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  stage.addEventListener('pointerdown', event => { start = event.pointerType === 'touch' && !expanded ? {x:event.clientX, y:event.clientY} : null; });
  stage.addEventListener('pointerup', event => {
    if (!start || expanded) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y; start = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
  });
  stage.addEventListener('pointercancel', () => { start = null; });
})();
