import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080/';

async function resetCookies(page, values) {
  await page.goto(BASE_URL);
  await page.evaluate((vals) => {
    document.cookie = `1=${vals['1']}`;
    document.cookie = `2=${vals['2']}`;
    document.cookie = `3=${vals['3']}`;
  }, values);
}

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await page.evaluate(() => {
    document.cookie = '1=false';
    document.cookie = '2=false';
    document.cookie = '3=false';
  });
});

test('TEST-1-RESET', async ({ page }) => {
  await resetCookies(page, { '1': 'true', '2': 'true', '3': 'true' });
  await page.click('a[href="/reset"]');
  const items = page.locator('#listing li');
  await expect(items.nth(0)).toHaveText('ID 1. Jennyanydots');
  await expect(items.nth(1)).toHaveText('ID 2. Old Deuteronomy');
  await expect(items.nth(2)).toHaveText('ID 3. Mistoffelees');
});

test('TEST-2-CATALOG', async ({ page }) => {
  await page.click('a[href="/"]');
  const firstImage = page.locator('img[alt="Jennyanydots"]');
  const secondImage = page.locator('img[alt="Old Deuteronomy"]');
  const thirdImage = page.locator('img[alt="Mistoffelees"]');
  await expect(firstImage).toHaveAttribute('src', '/images/cat1.jpg');
  await expect(secondImage).toHaveAttribute('src', '/images/cat2.jpg');
  await expect(thirdImage).toHaveAttribute('src', '/images/cat3.jpg');
});

test('TEST-3-LISTING', async ({ page }) => {
  await page.click('a[href="/"]');
  const items = page.locator('#listing li');
  await expect(items).toHaveCount(3);
  await expect(items.nth(2)).toHaveText('ID 3. Mistoffelees');
});

test('TEST-4-RENT-A-CAT', async ({ page }) => {
  await page.click('a[href="/rent-a-cat"]');
  await expect(page.locator('button[onclick="rentSubmit()"]')).toBeVisible();
  await expect(page.locator('button[onclick="returnSubmit()"]')).toBeVisible();
});

test('TEST-5-RENT', async ({ page }) => {
  await page.click('a[href="/rent-a-cat"]');
  await page.fill('#rentID', '1');
  await page.click('button[onclick="rentSubmit()"]');
  const items = page.locator('#listing li');
  await expect(items.nth(0)).toHaveText('Rented out');
  await expect(items.nth(1)).toHaveText('ID 2. Old Deuteronomy');
  await expect(items.nth(2)).toHaveText('ID 3. Mistoffelees');
  await expect(page.locator('#rentResult')).toHaveText('Success!');
});

test('TEST-6-RETURN', async ({ page }) => {
  await resetCookies(page, { '1': 'false', '2': 'true', '3': 'true' });
  await page.click('a[href="/rent-a-cat"]');
  await page.fill('#returnID', '2');
  await page.click('button[onclick="returnSubmit()"]');
  const items = page.locator('#listing li');
  await expect(items.nth(0)).toHaveText('ID 1. Jennyanydots');
  await expect(items.nth(1)).toHaveText('ID 2. Old Deuteronomy');
  await expect(items.nth(2)).toHaveText('Rented out');
  await expect(page.locator('#returnResult')).toHaveText('Success!');
});

test('TEST-7-FEED-A-CAT', async ({ page }) => {
  await page.click('a[href="/feed-a-cat"]');
  await expect(page.locator('button[onclick="setTimeout(feedSubmit, 7000)"]')).toBeVisible();
});

test('TEST-8-FEED', async ({ page }) => {
  await page.click('a[href="/feed-a-cat"]');
  await page.fill('#catnips', '6');
  await page.click('button[onclick="setTimeout(feedSubmit, 7000)"]');
  await expect(page.locator('#feedResult')).toHaveText('Nom, nom, nom.', { timeout: 15000 });
});

test('TEST-9-GREET-A-CAT', async ({ page }) => {
  await page.click('a[href="/greet-a-cat"]');
  await expect(page.locator('body')).toContainText('Meow!Meow!Meow!');
});

test('TEST-10-GREET-A-CAT-WITH-NAME', async ({ page }) => {
  await page.goto(`${BASE_URL}/greet-a-cat/Jennyanydots`);
  await expect(page.locator('body')).toContainText('Meow! from Jennyanydots.');
});

test('TEST-11-FEED-A-CAT-SCREENSHOT', async ({ page }) => {
  await resetCookies(page, { '1': 'true', '2': 'true', '3': 'true' });
  await page.click('a[href="/feed-a-cat"]');
  await expect(page.locator('body')).toHaveScreenshot();
});