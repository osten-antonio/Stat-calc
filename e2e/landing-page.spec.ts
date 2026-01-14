import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("loads with Stats Stuff title", async ({ page }) => {
    await page.goto("/");
    
    await expect(page).toHaveTitle(/Stats Stuff/);
    await expect(page.getByRole("heading", { name: /Stats Stuff/ })).toBeVisible();
  });

  test("displays categorized calculator tables", async ({ page }) => {
    await page.goto("/");
    
    await expect(page.getByRole("heading", { name: "Probability" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Counting" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Inference" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Data" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Reference" })).toBeVisible();
  });

  test("has calculator links including ANOVA", async ({ page }) => {
    await page.goto("/");
    
    await expect(page.getByRole("link", { name: "Binomial" })).toBeVisible();
    await expect(page.getByRole("link", { name: "T-Tests" })).toBeVisible();
    await expect(page.getByRole("link", { name: "ANOVA" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Regression" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Statistical Tables" })).toBeVisible();
  });

  test("links point to correct routes", async ({ page }) => {
    await page.goto("/");
    
    await expect(page.getByRole("link", { name: "Binomial" })).toHaveAttribute("href", "/binomial");
    await expect(page.getByRole("link", { name: "ANOVA" })).toHaveAttribute("href", "/anova");
  });
});
