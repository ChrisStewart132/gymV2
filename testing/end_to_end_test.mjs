/*  
  DOCS (headless browser)
  https://pptr.dev/
  https://pptr.dev/api/puppeteer.page.title

  HOSTING   
  Navigate into /docs/ (cd docs)
  python -m http.server

  TESTING
  run: node --test
*/
import { test } from "node:test";
import assert from "node:assert/strict";

import puppeteer from 'puppeteer';

const URL = "http://127.0.0.1:8000/index.html"

function sleep(ms) {
  console.log(`sleeping: ${ms}ms`)
  return new Promise(resolve => {
      setTimeout(resolve, ms);
  });
}
async function get_browser(){
  return await puppeteer.launch();
}
async function get_home_page(browser){
  const page = await browser.newPage();
  await page.goto(URL);
  await sleep(2000)
  return page
}
async function get_title(page){
    return await page.title()
}

async function exercise_count(page){
  let count = await page.evaluate(() => {
      const container = document.querySelector('.container');
      let exercises = Array.from(container.children);
      return exercises.reduce((total, element) => {
          if (!element.classList.contains('hidden')) {
              return total + 1;
          }
          return total;
      }, 0);
  });
  return count;
}



test("home page", { only: true }, async () => {
    let browser = await get_browser()
    let page = await get_home_page(browser)

    assert.strictEqual("GymV2", await get_title(page));
    assert.strictEqual(525, await exercise_count(page));
    await page.screenshot({path: `testing/images/home.png`});
    await browser.close();
});

test("equipment filter", { only: true }, async () => {
  let browser = await get_browser()
  let page = await get_home_page(browser)
  let count

  count = await page.evaluate(() => {
    const inputElement = document.querySelector('#equipment').value = `${"t-bar"}`;
    applyFilter()
    let exercises = Array.from(document.querySelector(`.container`).children)
    return exercises.reduce((t, e) => {return e.classList.contains(`hidden`) ? t : t+1}, 0)
  })
  sleep(1000)
  await page.screenshot({path: `testing/images/${"t-bar"}.png`});
  assert.strictEqual(1, count);

  count = await page.evaluate(() => {
    const inputElement = document.querySelector('#equipment').value = `${"kettlebell"}`;
    applyFilter()
    let exercises = Array.from(document.querySelector(`.container`).children)
    return exercises.reduce((t, e) => {return e.classList.contains(`hidden`) ? t : t+1}, 0)
  })
  sleep(1000)
  await page.screenshot({path: `testing/images/${"kettlebell"}.png`});
  assert.strictEqual(4, count);

  await browser.close();
});