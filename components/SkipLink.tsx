'use client';

import React from 'react';

/**
 * Skip to main content link for keyboard users.
 * Allows users to bypass navigation and jump directly to main content.
 * WCAG 2.1 AA: 2.4.1 Bypass Blocks
 */
export default function SkipLink() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const main = document.getElementById('main-content');
    if (main) {
      main.focus();
      main.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href="#main-content"
      className="skip-link"
      onClick={handleClick}
    >
      Skip to main content
    </a>
  );
}
