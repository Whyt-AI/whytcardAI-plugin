---
name: wc-visual-verify
description: Mandatory visual verification for any UI change. Takes screenshots at 3 viewports, evaluates design quality, checks dark/light modes. Use after ANY UI modification.
---

# Visual Verification Protocol

This is mandatory after ANY UI change. No exceptions.

## Checklist

1. **Take screenshots at 3 viewports**
   - Mobile: 375px width
   - Tablet: 768px width
   - Desktop: 1440px width

2. **Check both modes**
   - Light mode screenshot
   - Dark mode screenshot (if supported)

3. **Evaluate as a user** — for each screenshot, answer:
   - Is the visual hierarchy clear? (most important = most visible)
   - Is the typography hierarchy respected? (h1 > h2 > h3 > body)
   - Are the spacings consistent and balanced?
   - Is the contrast sufficient? (AA minimum)
   - Does it look professional and polished?
   - Would I be proud to ship this?

4. **Check specific issues**
   - No horizontal overflow on mobile
   - No text truncation that hides meaning
   - No broken layouts at any viewport
   - Focus indicators visible on interactive elements
   - Animations respect prefers-reduced-motion

5. **Verdict**
   - READY: all checks pass at all viewports
   - NOT READY: list specific issues with file:line references

## How to take screenshots

Use available browser/screenshot tools (Playwright, browser automation, or built-in screenshot tool):

1. Navigate to the page
2. Set viewport to 375×812 → take screenshot (mobile)
3. Set viewport to 768×1024 → take screenshot (tablet)
4. Set viewport to 1440×900 → take screenshot (desktop)

If no browser tool is available, ask the user to verify the visual result manually.

## Escalation for visual issues

1. Adjust token/value (fastest, widest impact)
2. Change utility class
3. Override with more specific selector
4. Inspect computed styles
5. Restructure component (last resort)
