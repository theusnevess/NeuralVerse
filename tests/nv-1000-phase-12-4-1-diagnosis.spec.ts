import { test, expect } from '@playwright/test';

test.describe('Stage 1: Parameters Runtime Diagnosis', () => {
  test('Parameters expanded-body parity - Gradient Descent', async ({ page }) => {
    await page.goto('/#/laboratory/gradient-descent');
    await page.waitForSelector('[data-lab-v4-workspace]', { timeout: 15000 });
    await page.waitForTimeout(1000);

    // Locate the v4 parameters panel
    const panel = page.locator('[data-lab-v4-parameters]');
    await expect(panel).toBeVisible();

    // Read disclosure state
    const disclosureState = await panel.getAttribute('data-disclosure-state');
    console.log('disclosureState:', disclosureState);

    // Read toggle aria-expanded
    const toggle = page.locator('[data-disclosure-toggle="parameters"]');
    const ariaExpanded = await toggle.getAttribute('aria-expanded');
    console.log('ariaExpanded:', ariaExpanded);

    // Read body hidden
    const body = page.locator('#v4-parameters-body');
    const bodyHidden = await body.getAttribute('hidden');
    console.log('bodyHidden:', bodyHidden);

    // Read computed styles of body
    const bodyStyles = await body.evaluate(el => {
      const cs = getComputedStyle(el);
      return {
        display: cs.display,
        visibility: cs.visibility,
        height: cs.height,
        overflow: cs.overflow,
        opacity: cs.opacity,
        maxHeight: cs.maxHeight
      };
    });
    console.log('bodyStyles:', JSON.stringify(bodyStyles));

    // Count reported controls
    const reportedCount = await page.locator('[data-param-count]').textContent();
    console.log('reportedCount:', reportedCount);

    // Count rendered controls inside [data-lab-parameters]
    const renderedCount = await page.locator('[data-lab-parameters] input, [data-lab-parameters] select, [data-lab-parameters] .nv-lab-param-group').count();
    console.log('renderedControlCount:', renderedCount);

    // Check what's actually inside [data-lab-parameters]
    const paramsHTML = await page.locator('[data-lab-parameters]').innerHTML();
    console.log('paramsHTML length:', paramsHTML.length);
    console.log('paramsHTML preview:', paramsHTML.substring(0, 500));

    // Check the panel body inner content
    const bodyInner = page.locator('#v4-parameters-body .nv-lab-v4-disclosure-panel__body-inner');
    const bodyInnerHTML = await bodyInner.innerHTML();
    console.log('bodyInnerHTML length:', bodyInnerHTML.length);
    console.log('bodyInnerHTML preview:', bodyInnerHTML.substring(0, 500));

    // Check if there's a legacy parameters container elsewhere
    const legacyParams = await page.locator('.nv-lab-ws-params, [data-lab-parameters]').count();
    console.log('legacyParamsContainers:', legacyParams);

    // Find all elements with data-lab-parameters
    const allParamsContainers = await page.locator('[data-lab-parameters]').all();
    console.log('allDataLabParameters count:', allParamsContainers.length);
    for (let i = 0; i < allParamsContainers.length; i++) {
      const el = allParamsContainers[i];
      const tagName = await el.evaluate(e => e.tagName);
      const parentTag = await el.evaluate(e => e.parentElement?.tagName || 'none');
      const parentId = await el.evaluate(e => e.parentElement?.id || 'none');
      const parentDataAttr = await el.evaluate(e => e.parentElement?.getAttribute('data-lab-v4-parameters') !== null ? 'yes' : 'no');
      const visible = await el.isVisible();
      const html = await el.innerHTML();
      console.log(`  [${i}] tag=${tagName} parent=${parentTag}#${parentId} parentIsV4Params=${parentDataAttr} visible=${visible} htmlLen=${html.length}`);
    }

    // Check if the old parameters container is still receiving renders
    const oldContainer = page.locator('.nv-lab-ws-params[data-lab-parameters]');
    const oldCount = await oldContainer.count();
    console.log('oldContainerCount:', oldCount);

    // Look for any parameter sliders anywhere on the page
    const allSliders = await page.locator('input[type="range"]').count();
    console.log('allSlidersOnPage:', allSliders);

    // Check if renderParameterControls was called
    const paramGroups = await page.locator('.nv-lab-param-group').count();
    console.log('paramGroupsOnPage:', paramGroups);

    // Store evidence
    const evidence = {
      disclosureState,
      ariaExpanded,
      bodyHidden: bodyHidden !== null,
      bodyDisplay: bodyStyles.display,
      bodyHeight: bodyStyles.height,
      bodyMaxHeight: bodyStyles.maxHeight,
      bodyOverflow: bodyStyles.overflow,
      bodyOpacity: bodyStyles.opacity,
      bodyVisibility: bodyStyles.visibility,
      reportedControlCount: reportedCount,
      renderedControlCount: renderedCount,
      paramsHTMLLength: paramsHTML.length,
      bodyInnerHTMLLength: bodyInnerHTML.length,
      legacyParamsCount: legacyParams,
      allParamsContainersCount: allParamsContainers.length,
      allSlidersOnPage: allSliders,
      paramGroupsOnPage: paramGroups
    };

    console.log('\n=== EVIDENCE ===');
    console.log(JSON.stringify(evidence, null, 2));

    // The critical assertion: rendered count should match reported count
    expect(renderedCount).toBeGreaterThan(0);
  });
});
