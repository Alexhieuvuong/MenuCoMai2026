# Implementation Plan - Sua Chua Co Mai Menu

## Goal Description
Refine the navigation layout, restrict the carousel to the "Best Seller" section, and add a "See More" interaction for other menu items.

## Proposed Changes

### Navigation Bar
- **Sidebar Tabs**: Update CSS to ensure tabs are evenly spaced or distributed nicely on mobile. Use `justify-content: space-between` or `flex-grow` if appropriate, or ensure consistent padding/gap.

### Menu Sections
- **Best Seller**:
  - Rename `#coffees` to `#best-seller` in HTML.
  - Update text to "Best Seller".
  - Keep `.menu-grid` styling (carousel) for this specific section.
- **Other Sections**:
  - Revert `.menu-grid` to a standard responsive grid (2 columns on mobile) for all other sections.
  - Remove auto-scroll JS logic for these sections.

### "See More" Feature
- **HTML**:
  - For items in non-carousel sections, add a `<button class="see-more-btn">See More</button>` below the image.
  - Add a hidden `<div class="ingredients-list">` with dummy ingredients (e.g., "Coffee, Milk, Sugar").
- **CSS**:
  - Style the button (simple, text-only or minimal border).
  - Style the ingredients list (initially `display: none`, toggle to `block`).
- **JS**:
  - Add event listener to "See More" buttons to toggle the visibility of the ingredients list.

## Verification Plan

### Manual Verification
- **Nav**: Check spacing of tabs on mobile.
- **Best Seller**: Verify it's still a carousel and auto-scrolls.
- **Other Sections**: Verify they are grids (not carousels) and do NOT auto-scroll.
- **See More**: Click the button and verify ingredients appear/disappear.
