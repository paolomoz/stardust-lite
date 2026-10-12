/*
 * cards — the foundation decorate: the pipeline's structure KEPT (`.cards > div` a card, `> div > div` a cell), each cell classed by its
 * content, so the CSS `spec-to-css` drafts for `.cards > div` lands on the card. The boilerplate's decorate rebuilt the block as ul > li and
 * every drafted grid held one list — the cards stacked in one column (exp/five-min replay). Replace it when a card needs its own DOM.
 */
import { decorateBlockIcons } from '../../scripts/stardust.js';

export default async function decorate(block) {
  [...block.children].forEach((card) => {
    card.classList.add('cards-card');
    [...card.children].forEach((cell) => {
      cell.classList.add(cell.children.length === 1 && cell.querySelector(':scope > picture, :scope > p > picture') ? 'cards-card-image' : 'cards-card-body');
    });
  });
  await decorateBlockIcons(block);
}
