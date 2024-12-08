/**
 * STORYLIB SHOULDN'T BE USED IN WEBSITES OTHER THEN STORYANVIL.GITHUB.IO
 * BECOUSE WE CHANGE IT A LOT AND WE DON'T HAVE ANY DOCS FOR IT!
 */
const $story = {
    url: new URL(document.location),
    init: () => {
        let section = "start";
        if ($story.url.searchParams.has("section")) {
            section = $story.url.searchParams.get("section");
        }
        if ($story.sections.hasOwnProperty(section)) {
            $story.sections[section]();
        }
    },
    sections: {},
    scrollTo: element => {
        document.scrollingElement.scrollTo(
            element.scrollLeft,
            element.scrollTop
        );
    },
    to: url => {
        if (window.location.href.indexOf("localhost:5500") != -1) {
            u = new URL("http://localhost:5500" + url);
            window.location = u;
        } else {
            window.location = "https://storyanvil.github.io" + url;
        }
    },
    md: hljs => {
        return {
            html: true,
            langPrefix: "language-",
            typographer: true,
            quotes: "“”‘’",
            highlight: function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(lang, str).value;
                    } catch (err) {}
                }

                try {
                    return hljs.highlightAuto(str).value;
                } catch (err) {}

                return ""; // use external default escaping
            },
        };
    },
    network: {
        tryLocal: (url, allow, localPort) => {
            if (allow && window.location.href.indexOf("localhost") != -1) {
                let p = new URL(url);
                return [
                    "http://" +
                        $story.url.hostname +
                        ":" +
                        localPort +
                        p.pathname,
                    true,
                ];
            } else {
                return [url, false];
            }
        },
        text: (url, tryLocalhost, handler, fail, localPort) => {
            fetch($story.network.tryLocal(url, tryLocalhost, localPort)[0])
                .then(r => {
                    r.text().then(handler).catch(fail);
                })
                .catch(fail);
        },
        json: (url, tryLocalhost, handler, fail) => {
            fetch($story.network.tryLocal(url, tryLocalhost))
                .then(r => {
                    r.json().then(handler).catch(fail);
                })
                .catch(fail);
        },
    },
    get: (key, defaulz) => {
        return $story.url.searchParams.has(key)
            ? $story.url.searchParams.get(key)
            : defaulz;
    },
};
