/*  
    script to gather exercise images and metadata from weight training guide.
*/

const SLEEP_TIME = 100;// ms to sleep before requests
async function sleep(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

async function get(url) {
    await sleep(SLEEP_TIME);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const html = await response.text(); // Get the HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return doc;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function download(jsonData) {
    const filename = jsonData.name;
    const jsonString = JSON.stringify(jsonData);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);

    await downloadImage(jsonData.image, filename)
}

async function downloadImage(url, filename) {
    await sleep(SLEEP_TIME);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const blob = await response.blob(); // Get the image data as a Blob
        const imageUrl = URL.createObjectURL(blob); // Create a URL for the Blob
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = filename; // Set the download attribute to specify the filename
        document.body.appendChild(a);
        a.click(); // Simulate a click on the link to trigger the download
        document.body.removeChild(a); // Clean up by removing the link element
    } catch (error) {
        console.error('Error downloading image:', error);
    }
}

async function process_article(a){
    /*
        exercise = {
            name:'bicep curl'
            equipment:'dumbell',
            default:True,// include in default workout for push/pull
            image:'url',
            Target muscles: Wrist Extensors,
            Synergists: None,
            Mechanics: Isolation,
            Force: Pull,
            tags:[
                    #dumbbells
                    #isolation
                    #pull
                    #wrist flexors
                ]
        }
    */
    //console.log(a)
    const link_element = a.querySelector(`a`);
    const article_url = link_element.href;
    let exercise_data = {"href": article_url}

    try{
        const article_page = await get(article_url);
        //console.log(article_page);
        const main_element = article_page.getElementById(`main`);
        const name = main_element.querySelector(`h1`).textContent;
        const exercise_image_src = main_element.querySelector(`img`).src;

        const footer_element = main_element.querySelector(`footer`);
        const tags = footer_element.querySelectorAll(`a`);
        let tag_arr = [];
        tags.forEach((a) => tag_arr.push(a.title));

        const article_element = main_element.querySelector(`article`);
        //console.log(article_element)
        const exercise_details_element = Array.from(article_element.querySelector(`ul`).children);
        exercise_details_element.forEach((li) => {
            const text = li.textContent;
            const key = text.split(":")[0];
            const value = text.split(":")[1];
            exercise_data[key] = value;
        })
        exercise_data['name'] = name;
        exercise_data['image'] = exercise_image_src;
        exercise_data['tags'] = tag_arr; 
    }catch(e){
        console.log(e)
    }
    console.log(exercise_data)
    await download(exercise_data)
}

async function main(){
    const N_PAGES = 54;
    const CONTAINER_ID = `archive-container`;
    const search_page_url = (page_n) => `https://weighttraining.guide/page/${page_n}/?s`
    
    for(let i = 0; i < N_PAGES; i++){
        const page_n = i+1;
        // get the nth page DOM
        try{
            var page = await get(search_page_url(page_n));
        }catch(e){
            console.log(e)
            continue;
        }
        //console.log(page)

        // get the container_element from the nth page
        const container_element = page.getElementById(CONTAINER_ID);
        //console.log(container_element);

        // get, iterate and process each entry/article within the container_element
        const articles = container_element.querySelectorAll(`article`);
        articles.forEach(process_article);
    }
}

main();