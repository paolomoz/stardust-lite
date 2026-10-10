import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { readFragmentSections, decorateBlockIcons } from '../../scripts/stardust.js';

/*
 * footer — foundation skeleton (init --foundation, the site owns it). The footer document's sections become
 * .footer > div.footer-1 … holding each section's CONTENT (the pipeline's .default-content-wrapper flattened away, its section
 * styles kept as classes), so footer.css styles one level. Nothing here is a measurement (see header.js).
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;

  // no inner `.footer` wrapper: the block element IS div.footer, and reset.css hides `footer .footer` until the block loads — an inner
  // div.footer never got data-block-status and stayed hidden (si-home, acs-about renamed it by hand). The sections sit on the block itself
  const footer = document.createDocumentFragment();
  readFragmentSections(fragment).forEach(({ wrapper, blocks, classes }, i) => {
    const div = document.createElement('div');
    div.className = `footer-${i + 1}${classes.length ? ` ${classes.join(' ')}` : ''}`;
    div.append(...wrapper.childNodes);
    blocks.forEach((b) => div.append(b));
    footer.append(div);
  });
  block.textContent = '';
  block.append(footer);
  await decorateBlockIcons(block);
}
