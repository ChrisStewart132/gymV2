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
const SLEEP_MS = 1000

function sleep(ms) {
  //console.log(`sleeping: ${ms}ms`)
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
  await sleep(SLEEP_MS)
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

const filter = (select_id, option) => {
  document.querySelector(`#${select_id}`).value = `${option}`;
  applyFilter()
  let exercises = Array.from(document.querySelector(`.container`).children)
  return exercises.reduce((t, e) => {return e.classList.contains(`hidden`) ? t : t+1}, 0)
}

const all_exercises_in_light_mode = () => {
  const exercises = Array.from(document.querySelectorAll(`.exercise`))
  const not_light_mode_count = exercises.reduce((t, e) => {
    const name = e.querySelector(`#name`)
    const img = e.querySelector(`img`)
    const is_light_mode = name.classList.contains(`lightMode`) && !img.src.includes(`exercises_inverted`)
    return is_light_mode ? t : t+1
  }, 0)
  return not_light_mode_count == 0
}

const toggle_dark_mode = () => {
  document.querySelector(`#${"darkModeBtn"}`).click()
}

async function main(){
  let browser = await get_browser()

  test("home page", { only: true }, async () => {
      let page = await get_home_page(browser)

      assert.strictEqual("GymV2", await get_title(page));
      assert.strictEqual(525, await exercise_count(page));
      await page.screenshot({path: `testing/images/home.png`});
  });

  test("light/dark mode", { only: true }, async () => {
    let page = await get_home_page(browser)
    await sleep(SLEEP_MS)
    // default dark_mode
    assert.strictEqual(false, await page.evaluate(all_exercises_in_light_mode));

    // turn on light_mode
    await page.evaluate(toggle_dark_mode)
    await sleep(SLEEP_MS)
    assert.strictEqual(true, await page.evaluate(all_exercises_in_light_mode));
    await page.screenshot({path: `testing/images/light_mode.png`});

    // turn on dark_mode
    await page.evaluate(toggle_dark_mode)
    await sleep(SLEEP_MS)
    assert.strictEqual(false, await page.evaluate(all_exercises_in_light_mode));
    await page.screenshot({path: `testing/images/dark_mode.png`});
});

  await test("equipment", { only: true }, async () => {
    let page = await get_home_page(browser)
    let count

    const id = "equipment"
    let option = "t-bar"
    count = await page.evaluate(filter, id, option)
    await sleep(SLEEP_MS)
    await page.screenshot({path: `testing/images/${option}.png`});
    assert.strictEqual(1, count);

    option = "kettlebell"
    count = await page.evaluate(filter, id, option)
    await sleep(SLEEP_MS)
    await page.screenshot({path: `testing/images/${"kettlebell"}.png`});
    assert.strictEqual(4, count);
  });

  await test("search", { only: true }, async () => {
    let page = await get_home_page(browser)
    let count

    const id = "searchInput"
    let option = "push"
    count = await page.evaluate(filter, id, option)
    await sleep(SLEEP_MS)
    await page.screenshot({path: `testing/images/${option}.png`});
    assert.strictEqual(27, count);
  });

  await test("target muscle", { only: true }, async () => {
    let page = await get_home_page(browser)
    let count
    
    const id = "TargetMuscleFilter"
    let option = "Biceps"
    
    count = await page.evaluate(filter, id, option)
    await sleep(SLEEP_MS)
    await page.screenshot({path: `testing/images/${option}.png`});
    assert.strictEqual(15, count);
  });

  await test("synergist muscle", { only: true }, async () => {
    let page = await get_home_page(browser)
    let count
    
    const id = "SynergistMuscleFilter"
    let option = "Deltoid"
    
    count = await page.evaluate(filter, id, option)
    sleep(SLEEP_MS)
    await page.screenshot({path: `testing/images/${option}.png`});
    assert.strictEqual(197, count);
  });

  await test("force", { only: true }, async () => {
    let page = await get_home_page(browser)
    let count
    
    const id = "ForceSelection"
    let option = " Pull"// blame db for the space
    
    count = await page.evaluate(filter, id, option)
    await sleep(SLEEP_MS)
    await page.screenshot({path: `testing/images/_${option}.png`});
    assert.strictEqual(276, count);

    option = " Push"// blame db for the space
    count = await page.evaluate(filter, id, option)
    sleep(SLEEP_MS)
    await page.screenshot({path: `testing/images/_${option}.png`});
    assert.strictEqual(242, count);
  });

  await test("combined filter", { only: true }, async () => {
    let page = await get_home_page(browser)
    let count
    
    const force_id = "ForceSelection"
    let force_option = " Pull"// blame db for the space
    count = await page.evaluate(filter, force_id, force_option)
    await sleep(SLEEP_MS)
    assert.strictEqual(276, count);

    const synergist_id = "SynergistMuscleFilter"
    let synergist_option = "Deltoid"
    count = await page.evaluate(filter, synergist_id, synergist_option)
    await sleep(SLEEP_MS)
    assert.strictEqual(82, count);

    const target_id = "TargetMuscleFilter"
    let target_option = "Lateral"
    count = await page.evaluate(filter, target_id, target_option)
    await sleep(SLEEP_MS)
    assert.strictEqual(14, count);

    const search_id = "searchInput"
    let search_option = ""
    count = await page.evaluate(filter, search_id, search_option)
    await sleep(SLEEP_MS)
    assert.strictEqual(14, count);

    const equipment_id = "equipment"
    let equipment_option = "dumbbells"
    count = await page.evaluate(filter, equipment_id, equipment_option)
    await sleep(SLEEP_MS)
    assert.strictEqual(8, count);

    await page.screenshot({path: `testing/images/${"combined_filter_test"}.png`});
  });

  browser.close();
}
main()