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
};
