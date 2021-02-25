// Input: Object holding result metadata.
// Output: Result element.
// Creates a result element.
const createResult = (data = {url: null, title: null, snippet: null}, classes = {result: "result", link: "link", url: "url", title: "title", snippet: "snippet"}) => {
    let result = document.createElement("div");
    let link = document.createElement("a");
    let url = document.createElement("h6");
    let title = document.createElement("h4");
    let snippet = document.createElement("p");
  
    // Format url portion of the result.
    // Check whether the url uses http or https, substring accordingly.
    let shortenedUrl = data.url;
    if (data.url[4] === "s") {
        shortenedUrl = shortenedUrl.substring(8, shortenedUrl.length);
    }
    else {
        shortenedUrl = shortenedUrl.substring(7, shortenedUrl.length);
    }
  
    if (shortenedUrl[shortenedUrl.length-1] === "/") {
        shortenedUrl = shortenedUrl.substring(0, shortenedUrl.length-1);
    }
    url.innerHTML = shortenedUrl;
    url.className = classes.url;
  
    // Format the rest of the result.
    result.className = classes.result === null ? "" : classes.result;
    link.setAttribute("href", data.url);
    link.setAttribute("target", "_blank");
    link.className = classes.link === null ? "" : classes.link;
    title.innerHTML = data.title;
    title.className = classes.title === null ? "" : classes.title;
    snippet.innerHTML = data.snippet;
    snippet.className = classes.snippet === null ? "" : classes.snippet;
  
    // Add the elements together
    result.appendChild(link);
    link.appendChild(url);
    link.appendChild(title);
    result.appendChild(snippet);
  
    return result;
} // Good
  
// Input: str is the string to bold all matching terms for.
//        Search phrase obtained from backend. 
// Output: String with bolded terms
// Bold all terms from the search phrase in the given string
const boldKeywords = (str, phrase) => {
    let bolded = str;
    phrase.keywords.forEach(keyword => {
        let innerRegex = " " + keyword.text + "(?=,| )";
        let regex = new RegExp(innerRegex, "gi");

        // This loop adds the bold tags to every regex match it finds.
        // Once bold tags are added, that term won't match the regex again since the space before the term gets removed. This avoids infinite loops.
        let match = regex.exec(bolded);
        while (match) {
            let matchStart = match.index + 1; // We add 1 because the regex includes a space at the beginning. Index.
            let matchEnd = matchStart + keyword.text.length; // Index.
            let firstHalf = bolded.substring(0, matchStart); // Each half excludes the matched string.
            let secondHalf = bolded.substring(matchEnd, bolded.length);
            let keywordFromStr = bolded.substring(matchStart, matchEnd); // Getting the term like this preserves its uppercase and lowercase letters from the original string.

            bolded = firstHalf + "<b>" + keywordFromStr + "</b>" + secondHalf;
            match = regex.exec(bolded); // Check if there are any more matches before the while condition is checked again.
        }
    });
    return bolded;
} // Good
  
// Input: res is what was obtained from the backend.
//        container is the results container
// Output: None.
// Populate the results container with results.
const populateResults = (data, container) => {
    data.results.forEach(result => {
        // Format each snippet.
        let formattedSnippets = [];
        result.snippets.forEach((snippet, index) => {
            formattedSnippets[index] = {
                text: boldKeywords(snippet.text, data.phrase),
                fromPageContent: snippet.fromPageContent
            };
        });

        // Concatenate all formatted snippets into one.
        let completeSnippet = '';
        if (formattedSnippets[0] !== null) {
            completeSnippet = formattedSnippets[0].text;
        }
        /*if (result.snippets[0]?.fromPageContent) {
        // If the first part of the snippet is in the middle of the page's content, add ellipses at the beginning of the snippet.
        completeSnippet = '... ';
        }*/
        /*formattedSnippets.forEach(snippet => {
        // Ensure that the snippet doesn't get too long (longer than 350 chars).
        let newLength = completeSnippet.length + snippet.text.length;
        if (newLength < 350) {
            completeSnippet += snippet.text;
        }
        })*/

        /*if (completeSnippet !== '') {
        completeSnippet = completeSnippet.substring(0, completeSnippet.length - 6); // Remove the ending ' ... '
        }*/
        //console.log("completeSnippet", completeSnippet);

        let metadata = {
            url: result.url, 
            title: result.title, 
            snippet: completeSnippet
        }
        //let resultElem = createResult(data);
        container.appendChild(createResult(metadata));
    });
} // Good
  
// Input: phpUrl is the url that links to the php script that will crawl the sitemap
//        data holds info to be used by the php script. Such info includes
//        data = { sitemap: "https://www.superiorcleaning.solutions/sitemap.xml" }
// Output: Response in json format
// Send the sitemap url to the php script that will fill the database accordingly
async function crawl(urlToCrawl) {
    let phpUrl = "http://localhost/dudaSearch/PHP/crawl.php";
    let sitemapUrl = urlToCrawl + "/sitemap.xml";
    // Default options are marked with *
    const response = await fetch(phpUrl, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({
        sitemap: sitemapUrl
      }) // body data type must match "Content-Type" header
    });
    //console.log(response.text());
    //return response.text();
    return response.json();
} // Good
  
// Input: Phrase is the search phrase that the user types.
//        baseUrl is used to generate the sitemap url and identify which site to search.
//        page tells the server what page to return. Each page has 10 results.
// Output: Response in json format.
// Search the database for all pages related to your search phrase.
async function search(phrase, baseUrl, options = {}) {
  if (options.page === null) {
    options.page = 1;
  }
  if (options.filterSymbols === null) {
    options.filterSymbols = true;
  }
  //let phpUrl = "http://localhost/dudaSearch/PHP/search.php";
  let phpUrl = "http://localhost/dudaSearch/PHP/search.php?url=" + baseUrl + "&phrase=" + phrase + "&page=" + options.page + "&filter_symbols=" + options.filterSymbols;
  // Default options are marked with *
  const response = await fetch(phpUrl, {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    //headers: {
    //  'Content-Type': 'application/json'
    //},
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer' // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  });
  return response.json();
}
  
// Input: (String) Phrase is the search phrase that the user has typed.
//        (String) baseUrl identifies which site to get suggestions for.
//        (Integer) limit tells the server the maximum amount of suggestions to return.
// Output: Response in json format.
// Search the database for all pages related to your search phrase.
async function fetchSuggestions(phrase, baseUrl, limit = 10) {
    let phpUrl = "http://localhost/dudaSearch/PHP/suggestions.php?url=" + baseUrl + "&phrase=" + phrase + "&limit=" + limit;
    // Default options are marked with *
    const response = await fetch(phpUrl, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        /*headers: {
          'Content-Type': 'application/json'
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },*/
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer' // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    });
    return response.json();
}