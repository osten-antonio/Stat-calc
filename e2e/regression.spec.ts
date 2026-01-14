import { test, expect } from "@playwright/test";

test.describe("Linear Regression Calculator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/regression");
  });

  test("displays page title and formula", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Linear Regression");
    await expect(page.locator("text=Regression Equation")).toBeVisible();
  });

  test("loads sample data when button clicked", async ({ page }) => {
    await page.click("text=Load Sample Data");
    
    const xCount = page.locator("text=X: 10 values");
    await expect(xCount).toBeVisible();
  });

  test("calculates regression with sample data", async ({ page }) => {
    await page.click("text=Load Sample Data");
    await page.click("text=Calculate Regression");

    await expect(page.locator("text=Results")).toBeVisible();
    await expect(page.locator("text=Slope (b)")).toBeVisible();
    await expect(page.locator("text=Intercept (a)")).toBeVisible();
    await expect(page.locator("text=r (correlation)")).toBeVisible();
  });

  test("shows step-by-step working", async ({ page }) => {
    await page.click("text=Load Sample Data");
    await page.click("text=Calculate Regression");

    await expect(page.locator("text=Step-by-Step Working")).toBeVisible();
    await expect(page.locator("text=Step 1: Identify the Data")).toBeVisible();
    await expect(page.locator("text=Step 4: Calculate Slope (b)")).toBeVisible();
  });

  test("shows statistical significance result", async ({ page }) => {
    await page.click("text=Load Sample Data");
    await page.click("text=Calculate Regression");

    await expect(page.locator("text=Statistical Significance")).toBeVisible();
    await expect(page.locator("text=t-statistic")).toBeVisible();
    await expect(page.locator("text=df")).toBeVisible();
  });

  test("can predict Y for a given X", async ({ page }) => {
    await page.click("text=Load Sample Data");
    await page.click("text=Calculate Regression");

    await page.fill('input[placeholder="Enter X"]', "7");
    await page.click('button:has-text("Predict")');

    await expect(page.locator("text=ŷ =")).toBeVisible();
  });

  test("shows sum of squares breakdown", async ({ page }) => {
    await page.click("text=Load Sample Data");
    await page.click("text=Calculate Regression");

    await expect(page.locator("text=Sum of Squares Breakdown")).toBeVisible();
    await expect(page.locator("text=SST (Total)")).toBeVisible();
    await expect(page.locator("text=SSR (Regression)")).toBeVisible();
    await expect(page.locator("text=SSE (Error)")).toBeVisible();
  });

  test("shows copy exam answer section", async ({ page }) => {
    await page.click("text=Load Sample Data");
    await page.click("text=Calculate Regression");

    await expect(page.locator("text=Copy Answer:")).toBeVisible();
    await expect(page.locator("text=Plain text")).toBeVisible();
    await expect(page.locator("text=Markdown")).toBeVisible();
  });

  test("shows error for mismatched data lengths", async ({ page }) => {
    const grid = page.locator('[class*="border-2"]').first();
    
    await page.fill('input[value=""]', "1");
    await page.click("text=Calculate Regression");

    await expect(page.locator("text=Need at least 2")).toBeVisible();
  });

  test("can switch between grid and raw mode", async ({ page }) => {
    await expect(page.locator("button:has-text('Grid')")).toBeVisible();
    await expect(page.locator("button:has-text('Raw')")).toBeVisible();

    await page.click("button:has-text('Raw')");
    await expect(page.locator("textarea")).toBeVisible();
  });
});
