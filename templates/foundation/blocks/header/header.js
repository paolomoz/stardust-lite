import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { readFragmentSections, decorateBlockIcons } from '../../scripts/stardust.js';

/*
 * header — foundation skeleton (init --foundation, the site owns it). The nav document's sections become
 * nav > div.nav-brand / .nav-sections / .nav-tools holding the sections' CONTENT: the pipeline's .default-content-wrapper is
 * flattened away here, so the CSS styles one level (three rounds went to a flex rule on the wrapper's parent — bny, loop r9;
 * the wrapper trap is METHOD step 5). Nothing below is a measurement: sizes, colours, the desktop breakpoint and the drawer's
 * look come from the spec into header.css. Structure only: a hamburger that toggles nav[aria-expanded], list items holding a
 * nested list get .nav-drop with aria-expanded, icons inlined with decorateBlockIcons.
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  const roles = ['brand', 'sections', 'tools'];
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');
  readFragmentSections(fragment).forEach(({ wrapper, blocks, classes }, i) => {
    const div = document.createElement('div');
    div.className = `nav-${roles[i] || `extra-${i}`}${classes.length ? ` ${classes.join(' ')}` : ''}`;
    div.append(...wrapper.childNodes);
    blocks.forEach((b) => div.append(b));
    nav.append(div);
  });

  const sections = nav.querySelector('.nav-sections');
  if (sections) {
    sections.querySelectorAll(':scope > ul > li').forEach((li) => {
      if (!li.querySelector('ul')) return;
      li.classList.add('nav-drop');
      li.setAttribute('aria-expanded', 'false');
      li.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        const open = li.getAttribute('aria-expanded') === 'true';
        sections.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((x) => x.setAttribute('aria-expanded', 'false'));
        li.setAttribute('aria-expanded', String(!open));
      });
    });
  }

  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = '<button type="button" aria-controls="nav" aria-label="Open navigation"><span class="nav-hamburger-icon"></span></button>';
  hamburger.addEventListener('click', () => {
    const open = nav.getAttribute('aria-expanded') === 'true';
    nav.setAttribute('aria-expanded', String(!open));
    document.body.style.overflowY = open ? '' : 'hidden';
  });
  nav.prepend(hamburger);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.textContent = '';
  block.append(navWrapper);
  await decorateBlockIcons(nav);
}
