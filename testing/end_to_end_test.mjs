/*  
  https://pptr.dev/
  https://pptr.dev/api/puppeteer.page.title

  run: node --test
*/
import { test } from "node:test";
import assert from "node:assert/strict";

import puppeteer from 'puppeteer';

const URL = "http://127.0.0.1:8000/index.html"

function sleep(ms) {
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
  return await page.$eval(`.container`, e => e.childElementCount)
}

test("home page test", { only: true }, async () => {
    let browser = await get_browser()
    let page = await get_home_page(browser)

    assert.strictEqual("GymV2", await get_title(page));
    assert.strictEqual(526, await exercise_count(page));

    await browser.close();
});