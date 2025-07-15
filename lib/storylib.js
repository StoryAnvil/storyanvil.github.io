/**
 * STORYLIB SHOULDN'T BE USED IN WEBSITES OTHER THEN STORYANVIL.GITHUB.IO
 * BECOUSE WE CHANGE IT A LOT AND WE DON'T HAVE ANY DOCS FOR IT!
 */
const $story = {
    url: new URL(document.location),
    init: () => {
        $story.debug.init();
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
            fetch(
                $story.debug.logFetch(
                    $story.network.tryLocal(url, tryLocalhost, localPort)[0]
                )
            )
                .then(r => {
                    r.text().then(handler).catch(fail);
                })
                .catch(fail);
        },
        json: (url, tryLocalhost, handler, fail) => {
            fetch(
                $story.debug.logFetch(
                    $story.network.tryLocal(url, tryLocalhost)
                )
            )
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
    debug: {
        data: "[sa-bugrock]",
        init: () => {
            $story.debug.data += `[URL:${$story.url.href}]`;
            $("body")[0].addEventListener("error", event => {});
            window.onerror = (msg, source, line, col, error) => {
                console.log(error);
                $story.debug.addRaw(`${error.name}(${msg}@${source}:${line})`);
            };
        },
        addError: err => {
            $story.debug.data += `[ERR:${err.name}:${err.message}]`;
        },
        bugReport: () => {
            localStorage.setItem(
                "limbo",
                btoa($story.debug.data).replace(/\+/g, "-").replace(/\//g, "_")
            );
            $story.to("/limbo.html");
        },
        addRaw: info => {
            $story.debug.data += "[" + info + "]";
        },
        logFetch: info => {
            $story.debug.data += `[FETCH:${info}]`;
            return info;
        },
    },
    wiki: {
        data: {},
        init: () => {
            $story.wiki.data.md = new window.Remarkable(
                "full",
                $story.md(hljs)
            );
            $story.debug.addRaw("Remarkable&Highlight::loaded");
            $story.wiki.data.repo = $story.get("repo", "BlogAndWiki");
            $story.wiki.data.branch = $story.get("v", "master");
            const f = $story.get("p", "home");
            if (f.endsWith(".sa.json")) {
                $story.wiki.data.file = f;
            } else {
                $story.wiki.data.file = f + ".md";
            }
            if ($story.wiki.data.file.endsWith(".md.md")) {
                $story.url.href = $story.url.href.replace(".md", "");
                window.location = $story.url;
            }
            $story.wiki.data.offline =
                window.location.href.indexOf("localhost") == -1;
            $story.wiki.data.github_link = `https://github.com/StoryAnvil/${$story.wiki.data.repo}/blob/${$story.wiki.data.branch}/${$story.wiki.data.file}`;
            $story.debug.addRaw("WIKI:" + $story.wiki.data.github_link);
        },
        openGitHub: () => {
            window.location = $story.wiki.data.github_link;
        },
        fetchAndRender: (loading_screen, content_form) => {
            $story.network.text(
                $story.wiki.data.offline
                    ? `https://raw.githubusercontent.com/StoryAnvil/${$story.wiki.data.repo}/${$story.wiki.data.branch}/${$story.wiki.data.file}`
                    : `https://raw.githubusercontent.com/${$story.wiki.data.file}`,
                !$story.wiki.data.offline,
                md_ => {
                    if ($story.wiki.data.file.endsWith(".sa.json")) {
                        $story.wiki.renderCogwheelSpec(loading_screen, content_form, JSON.parse(md_));
                        return;
                    }

                    content_form.innerHTML = $story.wiki.data.md.render(md_);

                    setTimeout(() => {
                        if ($story.url.href.indexOf("wiki/dev") == -1) {
                            if ($("fromDevsToDevs").length > 0) {
                                $story.to(
                                    `/wiki/dev.html?repo=${$story.wiki.data.repo}&v=${$story.wiki.data.branch}&p=${$story.wiki.data.file}`
                                );
                            }
                        } else {
                            if ($("fromDevsToDevs").length == 0) {
                                $story.to(
                                    `/wiki/wiki.html?repo=${$story.wiki.data.repo}&v=${$story.wiki.data.branch}&p=${$story.wiki.data.file}`
                                );
                            }
                        }
                    }, 500);
                },
                err => {
                    console.error(err);
                    $story.debug.addError(err);
                    loading_screen.innerHTML = `Failed to load. [${err.name}: ${err.message}]<br><a onclick="$story.debug.bugReport()">Click here to report this bug</a>`;
                },
                5501
            );
        },
        renderCogwheelSpec: (loading_screen, content_form, json) => {
            const md = (md) => $story.wiki.data.md.render(md);
            const fail = (msg) => {
                console.error(msg);
                $story.debug.addError(msg);
                loading_screen.innerHTML = `Failed to parse Cogwheel Specification. [${msg}]<br><a onclick="$story.debug.bugReport()">Click here to report this bug</a>`;
            }
            let html = "";
            if (json.type == "OBJECT") {
                html += `<div class="cw-top"><h2 class="cw-title">${json.name}</h2><p class="cw-summary">${md(json.summary)}</p></div><table class="cw-table"><thead><tr><th>Method</th><th>Description</th></tr></thead>`;
                const methods = Object.keys(json.methods);
                $story.data = {};
                $story.data.alerts = {};
                for (let i = 0; i < methods.length; i++) {
                    const name = methods[i];
                    const method = json.methods[name];
                    let args = "";
                    for (let ii = 0; ii < method.argTypes.length; ii++) {
                        const type = method.argTypes[ii];
                        const argName = method.argNames[ii];
                        if (type === "*") {
                            args += `<span class="badge b-cf cw-badge">Any Object</span> ${argName}`;
                            continue;
                        }
                        args += `<a onclick="$story.to('/wiki/wiki.html?p=wiki/projects/cogwheel/specs/${type}.sa.json')">${type}</a> ${argName}`;
                    }
                    let returnType = method.return;
                    if (returnType != "null") {
                        returnType = `<a onclick="$story.to('/wiki/wiki.html?p=wiki/projects/cogwheel/specs/${returnType}.sa.json')">${returnType}</a>`;
                    } else {
                        returnType = `<span>nothing</span>`;
                    }
                    let corner = "";
                    if (method.hasOwnProperty("noChainCalling")) {
                        corner += `<span class="badge b-cf cw-badge cw-chain-block">Chain Calling Prevented</span>`;
                    }
                    let corner2 = "";
                    if (method.hasOwnProperty("text")) {
                        $story.data.alerts[name] = method.text;
                        corner2 += `<button onclick="$story.wiki.alert('${name}')">Show more</button>`;
                    }
                    html += `<tr><th>${name}(${args})<br><span class="cw-return">Returns ${returnType}</span><div class="cw-corner">${corner}</div></th><th>${md(method.summary)}<div class="cw-corner">${corner2}</div></th></tr>`
                }
                html += `</table>`;
            } else {
                fail("Unknown type");
            }
            content_form.innerHTML = html;
        },
        alert: (texT2) => {
            const text = $story.data.alerts[texT2].replaceAll("$$", "\n");
            const a = $("#alert")[0];
            a.innerHTML = `<div class="alert-wrapper">${$story.wiki.data.md.render(text)}<button class="alert-close" onclick="$story.wiki.hideAlert()">Close</button></div>`;
            a.style.display = "block";
        },
        hideAlert: () => {
            const a = $("#alert")[0];
            a.style.display = "none";
        }
    },
};
