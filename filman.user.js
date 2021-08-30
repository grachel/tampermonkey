// ==UserScript==
// @name         Filman.cc
// @namespace    http://tampermonkey.net/
// @version      0.13
// @description  Filman script
// @author       You
// @match        https://filman.cc/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    function doIfExists(query, func) {
        const elems = document.querySelector(query);
        if (elems) {
            func(elems);
        }
    }

    function blockSiteJS(e) {
        doIfExists('.filman', () => {
            e.stopPropagation();
            e.preventDefault();
            e.target.parentNode.removeChild(e.target);
        });
    }

    function removeElements() {
        const elementsToRemove = [
            "#color-switch",
            "#cookies",
            "#fb-root",
            "#belt",
            "header",
            ".filman",
            "center",
            ".description",
            "#single-poster",
            "div.clearfix  > div.text-right",
            "thead > tr.version",
            "#wrapper > .container",
            ".fa-sort"
        ];
        document.querySelectorAll(elementsToRemove.join(",")).forEach(function (item) {
            item.remove();
        });
    }

    function addFiltering() {
        document.querySelectorAll("a.select-version").forEach(function (item) {
            item.removeAttribute("href");
            item.setAttribute("style", "cursor: pointer");

            item.addEventListener('click', function () {
                const selectedVersion = item.textContent;
                document.querySelectorAll("tr.version").forEach(function (item) {
                    item.setAttribute("style", "");
                });
                if (selectedVersion !== 'Wszystkie') {
                    document.querySelectorAll("tr.version").forEach(function (item) {
                        if (!item.textContent.includes(selectedVersion) ||
                            (selectedVersion === 'Lektor' && item.textContent.includes('Lektor_IVO')) ||
                            (selectedVersion === 'Napisy' && item.textContent.includes('Napisy_Tansl'))
                        ) {
                            item.setAttribute("style", "display: none");
                        }
                    });
                }
            });
        });
    }

    function extractLinkData() {
        document.querySelectorAll(".link-to-video > a").forEach(function (item) {
            item.removeAttribute("href");
            item.removeAttribute("target");
            item.setAttribute("style", "cursor: pointer");

            item.addEventListener('click', function () {
                if (window.opener) {
                    const url = JSON.parse(atob(item.getAttribute('data-iframe'))).src;
                    const path = location.pathname.split('/');
                    var name = path[2];
                    var sname = '';
                    if (path[1] === 'serial-online') {
                        sname = name;
                        name = document.querySelector('h3').textContent;
                    }
                    var msg = url + "|" + name;
                    if (sname) {
                        msg += "|" + sname;
                    }
                    window.opener.postMessage(msg, "*");
                }

            }, false);
        });
    }

    function documentLoaded() {
        removeElements();

        doIfExists('#item-info', el => el.classList = []);
        doIfExists('#link-list', el => el.setAttribute("style", ""));
        doIfExists('body', el => el.setAttribute("style", "padding: 2em"));

        addFiltering();
        extractLinkData();
    }

    document.addEventListener('beforescriptexecute', blockSiteJS, true);
    document.addEventListener("DOMContentLoaded", documentLoaded);
})();