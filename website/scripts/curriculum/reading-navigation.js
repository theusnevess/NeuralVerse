/**
 * NV-900-UI7 — Reading & Study Experience
 * Client-side behaviors for technical technical long-form study,
 * including Table of Contents (TOC), Sticky Header, and Progress indicators.
 */

(function () {
  'use strict';

  function typeLabel(type) {
    return type === 'Interactive Visualization' ? 'Interactive Visualization Specification' : type;
  }

  function statusBadge(status) {
    const badge = document.createElement('span');
    badge.className = 'nv-badge';
    badge.dataset.variant = status === 'Reviewed' ? 'success' : 'neutral';
    badge.textContent = status || 'Draft';
    badge.title = `${status} is a curriculum lifecycle status. It does not imply certification or learner achievement.`;
    return badge;
  }

  function initReadingExperience({ pathId, moduleId, lessonId, artifactId, artifact, lesson, mainContent }) {
    if (!mainContent) return;

    // 1. Prepend Sticky Reading Header
    const existingHeader = mainContent.querySelector('.nv-sticky-reading-header');
    if (existingHeader) existingHeader.remove();

    const stickyHeader = document.createElement('div');
    stickyHeader.className = 'nv-sticky-reading-header';
    stickyHeader.setAttribute('role', 'banner');

    const headerContent = document.createElement('div');
    headerContent.className = 'nv-sticky-reading-header__content';

    const leftGroup = document.createElement('div');
    leftGroup.className = 'nv-sticky-reading-header__left';

    const titleEl = document.createElement('span');
    titleEl.className = 'nv-sticky-reading-header__title';
    titleEl.textContent = artifact.title;

    const typeEl = document.createElement('span');
    typeEl.className = 'nv-sticky-reading-header__type';
    typeEl.textContent = typeLabel(artifact.type);

    const badge = statusBadge(artifact.canonicalStatus || 'Draft');

    leftGroup.append(titleEl, typeEl, badge);

    const rightGroup = document.createElement('div');
    rightGroup.className = 'nv-sticky-reading-header__right';

    const lessonLabel = document.createElement('span');
    lessonLabel.className = 'nv-sticky-reading-header__lesson-label';
    lessonLabel.textContent = `Lesson: ${lesson.title}`;

    const backBtn = document.createElement('a');
    backBtn.className = 'nv-button nv-button--back-to-lesson';
    backBtn.dataset.variant = 'secondary';
    backBtn.href = `#/learning/${pathId}/module/${moduleId}/lesson/${lessonId}`;
    backBtn.textContent = 'Back to Lesson';

    rightGroup.append(lessonLabel, backBtn);

    const progressBar = document.createElement('div');
    progressBar.className = 'nv-sticky-reading-header__progress-bar';

    stickyHeader.append(headerContent, progressBar);
    headerContent.append(leftGroup, rightGroup);

    // Render sticky header before other content
    mainContent.insertBefore(stickyHeader, mainContent.firstChild);

    // 2. Wrap Tables in responsive scroll containers
    const article = mainContent.querySelector('.nv-curriculum-reader');
    if (article) {
      const tables = Array.from(article.querySelectorAll('.nv-curriculum-table'));
      tables.forEach(table => {
        if (table.parentNode && table.parentNode.className !== 'nv-table-container') {
          const container = document.createElement('div');
          container.className = 'nv-table-container';
          table.parentNode.insertBefore(container, table);
          container.append(table);
        }
      });

      // 3. Add copy button to pre elements
      const preElements = Array.from(article.querySelectorAll('pre'));
      preElements.forEach(pre => {
        if (!pre.querySelector('.nv-copy-code-btn')) {
          pre.style.position = 'relative';
          const copyBtn = document.createElement('button');
          copyBtn.className = 'nv-copy-code-btn';
          copyBtn.type = 'button';
          copyBtn.textContent = 'Copy';
          copyBtn.setAttribute('aria-label', 'Copy code to clipboard');

          copyBtn.addEventListener('click', async () => {
            const code = pre.querySelector('code');
            if (code) {
              try {
                await navigator.clipboard.writeText(code.textContent);
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                  copyBtn.textContent = 'Copy';
                }, 2000);
              } catch (err) {
                console.error('Failed to copy: ', err);
              }
            }
          });
          pre.append(copyBtn);
        }
      });
    }

    // 4. Extract H2, H3, H4 headings for Table of Contents
    const headings = article ? Array.from(article.querySelectorAll('h2, h3, h4')) : [];
    
    // Assign unique IDs to headings if not already set
    headings.forEach((heading, idx) => {
      if (!heading.id) {
        const slug = heading.textContent
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        heading.id = slug || `reading-heading-${idx}`;
      }
    });

    // 5. Generate Table of Contents (Desktop Sidebar and Mobile Collapsible Accordion)
    const metadataCol = document.querySelector('.nv-lesson-workspace__metadata-col');
    if (metadataCol) {
      const existingTOC = metadataCol.querySelector('.nv-toc-card');
      if (existingTOC) existingTOC.remove();

      if (headings.length > 0) {
        const tocCard = document.createElement('div');
        tocCard.className = 'nv-panel nv-lesson-workspace__metadata-card nv-toc-card nv-stack nv-stack--gap-sm';

        const tocTitle = document.createElement('h3');
        tocTitle.className = 'nv-lesson-workspace__section-title';
        tocTitle.textContent = 'Table of Contents';

        const tocList = document.createElement('ul');
        tocList.className = 'nv-toc-list';

        headings.forEach(heading => {
          const li = document.createElement('li');
          li.className = `nv-toc-item nv-toc-item--${heading.tagName.toLowerCase()}`;

          const a = document.createElement('a');
          a.className = 'nv-toc-link';
          a.href = `#${heading.id}`;
          a.textContent = heading.textContent;

          a.addEventListener('click', (e) => {
            e.preventDefault();
            heading.scrollIntoView({ behavior: 'smooth' });
            history.replaceState(null, null, `#${heading.id}`);
          });

          li.append(a);
          tocList.append(li);
        });

        tocCard.append(tocTitle, tocList);
        metadataCol.append(tocCard);
      }
    }

    // Mobile Collapsible TOC
    if (article && headings.length > 0) {
      const existingMobileTOC = article.querySelector('.nv-mobile-toc');
      if (existingMobileTOC) existingMobileTOC.remove();

      const mobileTOC = document.createElement('details');
      mobileTOC.className = 'nv-mobile-toc';

      const summary = document.createElement('summary');
      summary.textContent = 'Table of Contents';
      
      const tocList = document.createElement('ul');
      tocList.className = 'nv-toc-list';

      headings.forEach(heading => {
        const li = document.createElement('li');
        li.className = `nv-toc-item nv-toc-item--${heading.tagName.toLowerCase()}`;

        const a = document.createElement('a');
        a.className = 'nv-toc-link';
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;

        a.addEventListener('click', (e) => {
          e.preventDefault();
          heading.scrollIntoView({ behavior: 'smooth' });
          history.replaceState(null, null, `#${heading.id}`);
          mobileTOC.removeAttribute('open');
        });

        li.append(a);
        tocList.append(li);
      });

      mobileTOC.append(summary, tocList);
      article.insertBefore(mobileTOC, article.firstChild);
    }

    // 6. Map and wrap Exercise sections (Learner Task, Expected Learner Output, Reasoning Guidance)
    if (article && artifact.type === 'Exercise') {
      const h4Elements = Array.from(article.querySelectorAll('h4'));
      h4Elements.forEach(heading => {
        const text = heading.textContent.toLowerCase();
        let type = '';
        if (text.includes('learner task')) {
          type = 'task';
        } else if (text.includes('expected learner output')) {
          type = 'output';
        } else if (text.includes('reasoning guidance')) {
          type = 'guidance';
        }

        if (type) {
          const container = document.createElement('div');
          container.className = `nv-exercise-section nv-exercise-section--${type}`;

          let next = heading.nextElementSibling;
          const siblings = [];
          while (next && !['H2', 'H3', 'H4'].includes(next.tagName) && !next.classList.contains('nv-cross-links-section') && !next.classList.contains('nv-reading-quick-nav')) {
            siblings.push(next);
            next = next.nextElementSibling;
          }

          if (heading.parentNode) {
            heading.parentNode.insertBefore(container, heading);
            container.append(heading);
            heading.className = `nv-exercise-section__title nv-exercise-section__title--${type}`;
            siblings.forEach(sib => container.append(sib));
          }
        }
      });
    }

    // 7. Inject Quick Reading Navigation Toolbar
    if (article) {
      const existingQuickNav = mainContent.querySelector('.nv-reading-quick-nav');
      if (existingQuickNav) existingQuickNav.remove();

      const quickNav = document.createElement('nav');
      quickNav.className = 'nv-reading-quick-nav nv-cluster';
      quickNav.setAttribute('aria-label', 'Quick reading navigation');

      const topBtn = document.createElement('button');
      topBtn.className = 'nv-button nv-button--quick-nav';
      topBtn.dataset.variant = 'secondary';
      topBtn.textContent = '↑ Top';
      topBtn.type = 'button';
      topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

      const prevSectionBtn = document.createElement('button');
      prevSectionBtn.className = 'nv-button nv-button--quick-nav';
      prevSectionBtn.dataset.variant = 'secondary';
      prevSectionBtn.textContent = '← Prev Section';
      prevSectionBtn.type = 'button';

      const nextSectionBtn = document.createElement('button');
      nextSectionBtn.className = 'nv-button nv-button--quick-nav';
      nextSectionBtn.dataset.variant = 'secondary';
      nextSectionBtn.textContent = 'Next Section →';
      nextSectionBtn.type = 'button';

      const navigateToAdjacentSection = (direction) => {
        const currentHeadings = Array.from(document.querySelectorAll('.nv-curriculum-reader h2, .nv-curriculum-reader h3, .nv-curriculum-reader h4'));
        if (!currentHeadings.length) return;

        let activeIndex = 0;
        for (let i = 0; i < currentHeadings.length; i++) {
          const rect = currentHeadings[i].getBoundingClientRect();
          if (rect.top <= 120) {
            activeIndex = i;
          } else {
            break;
          }
        }

        const targetIndex = activeIndex + direction;
        if (targetIndex >= 0 && targetIndex < currentHeadings.length) {
          currentHeadings[targetIndex].scrollIntoView({ behavior: 'smooth' });
          history.replaceState(null, null, `#${currentHeadings[targetIndex].id}`);
        }
      };

      prevSectionBtn.addEventListener('click', () => navigateToAdjacentSection(-1));
      nextSectionBtn.addEventListener('click', () => navigateToAdjacentSection(1));

      const tocBtn = document.createElement('button');
      tocBtn.className = 'nv-button nv-button--quick-nav nv-mobile-only';
      tocBtn.dataset.variant = 'secondary';
      tocBtn.textContent = '☰ TOC';
      tocBtn.type = 'button';
      tocBtn.addEventListener('click', () => {
        const mobileTOC = document.querySelector('.nv-mobile-toc');
        if (mobileTOC) {
          mobileTOC.open = true;
          mobileTOC.scrollIntoView({ behavior: 'smooth' });
        }
      });

      const backToLessonBtn = document.createElement('a');
      backToLessonBtn.className = 'nv-button nv-button--quick-nav';
      backToLessonBtn.dataset.variant = 'secondary';
      backToLessonBtn.href = `#/learning/${pathId}/module/${moduleId}/lesson/${lessonId}`;
      backToLessonBtn.textContent = 'Back to Lesson';

      quickNav.append(topBtn, prevSectionBtn, nextSectionBtn, tocBtn, backToLessonBtn);
      
      // Insert after the article
      article.parentNode.insertBefore(quickNav, article.nextSibling);
    }

    // 8. Progress and Active TOC highlight scroll bindings
    const updateScrollMetrics = () => {
      const activeArticle = document.querySelector('.nv-curriculum-reader');
      const bar = document.querySelector('.nv-sticky-reading-header__progress-bar');
      if (!activeArticle) return;

      // Scroll Progress Bar Update
      if (bar) {
        const rect = activeArticle.getBoundingClientRect();
        const totalHeight = rect.height;
        const scrolled = Math.max(0, -rect.top);
        const visibleHeight = window.innerHeight - 80;
        const maxScroll = totalHeight - visibleHeight;

        let progress = 0;
        if (maxScroll > 0) {
          progress = Math.min(1, scrolled / maxScroll);
        } else if (rect.bottom <= window.innerHeight) {
          progress = 1;
        }
        bar.style.transform = `scaleX(${progress})`;
      }

      // TOC Section Highlight
      const activeHeadings = Array.from(document.querySelectorAll('.nv-curriculum-reader h2, .nv-curriculum-reader h3, .nv-curriculum-reader h4'));
      const tocLinks = Array.from(document.querySelectorAll('.nv-toc-link'));
      if (activeHeadings.length && tocLinks.length) {
        let activeHeading = activeHeadings[0];
        for (const heading of activeHeadings) {
          const rect = heading.getBoundingClientRect();
          if (rect.top <= 120) {
            activeHeading = heading;
          } else {
            break;
          }
        }

        tocLinks.forEach(link => {
          if (link.getAttribute('href') === `#${activeHeading.id}`) {
            link.classList.add('nv-toc-link--active');
            link.setAttribute('aria-current', 'location');
          } else {
            link.classList.remove('nv-toc-link--active');
            link.removeAttribute('aria-current');
          }
        });
      }
    };

    let scrollTicking = false;
    const onScroll = () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          updateScrollMetrics();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onScroll);

    // Initial run
    updateScrollMetrics();

    // Clean up older listeners on page navigation/hashchange
    const cleanup = () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('keydown', handleKeyNav);
    };

    window.addEventListener('hashchange', cleanup, { once: true });

    // Keyboard Accessibility keys (Home/End/Escape)
    const handleKeyNav = (e) => {
      if (e.key === 'Home') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'End') {
        e.preventDefault();
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      } else if (e.key === 'Escape') {
        // Close collapsible overlays if any
        const mobileTOC = document.querySelector('.nv-mobile-toc');
        if (mobileTOC && mobileTOC.hasAttribute('open')) {
          e.preventDefault();
          mobileTOC.removeAttribute('open');
        }
      }
    };
    document.addEventListener('keydown', handleKeyNav);
  }

  // Register in global namespace
  window.NeuralVerse = window.NeuralVerse || {};
  window.NeuralVerse.initReadingExperience = initReadingExperience;

})();
