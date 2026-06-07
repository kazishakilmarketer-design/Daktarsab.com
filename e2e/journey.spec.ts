import { test, expect } from "@playwright/test";

test.describe("DaktarSab E2E User Journey Tests", () => {
  
  test("1. Home Dashboard Page Load & Title", async ({ page }) => {
    // Go to the home page (Vite preview server)
    await page.goto("/home");

    // Verify correct page title is rendered
    const title = await page.title();
    expect(title).toContain("ডাক্তার সাব");
    
    // Check key landing/marketing elements are present
    await expect(page.locator("text=আমাদের সেবাসমূহ")).toBeVisible();
    await expect(page.locator("text=জনপ্রিয় ডাক্তারগণ")).toBeVisible();
  });

  test("2. SPA Navigation (No Full-Page Reloads)", async ({ page }) => {
    await page.goto("/home");

    // Define a flag on the window object to detect full page refreshes
    await page.evaluate(() => {
      (window as any).__isSPAPreserve = true;
    });

    // Locate the "Join as Partner" CTA button on the Home Dashboard and click it
    const partnerBtn = page.locator("text=পার্টনার হিসেবে আজই যোগ দিন");
    await expect(partnerBtn).toBeVisible();
    await partnerBtn.click();

    // Verify it navigated to /join-as-partner
    await page.waitForURL("**/join-as-partner");
    expect(page.url()).toContain("/join-as-partner");

    // Check if the window flag survived. If a reload happened, the flag would be undefined.
    const isSPAPreserved = await page.evaluate(() => (window as any).__isSPAPreserve);
    expect(isSPAPreserved).toBe(true);
  });

  test("3. Layout Header Rendering (No Duplicate Header Bug)", async ({ page }) => {
    // Go directly to the Features page
    await page.goto("/features");

    // Make sure the features page content is visible
    await expect(page.locator("text=সকল সেবাসমূহ")).toBeVisible();

    // Count the number of logo instances within the page header
    // The global Header component renders the Logo component (img or svg)
    // Assert exactly one global Header exists on the screen
    const headerCount = await page.locator("header").count();
    expect(headerCount).toBe(1);
  });

  test("4. Doctor Directory Search Flow", async ({ page }) => {
    await page.goto("/doctors");

    // Check the doctor directory page layout
    await expect(page.locator("text=বিশেষজ্ঞ ডাক্তার")).toBeVisible();

    // Verify that the search input is present
    const searchInput = page.locator("input[placeholder*='হাসপাতাল']");
    await expect(searchInput).toBeVisible();
  });
});
