/**
 * Events.js for site owners.
 * Fetches and renders active events from IAȘI events platform based on given filters.
 *
 * @link https://iasievents.ro
 * @link https://github.com/iasievents/events.js-for-site-owners
 *
 * @license MIT
 */

'use strict';

if (typeof Object.assign !== 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
        value: function assign(target, varArgs) { // .length of function is 2
            'use strict';
            if (target === null) { // TypeError if undefined or null
                throw new TypeError('Cannot convert undefined or null to object');
            }

            let to = Object(target);
            for (let index = 1; index < arguments.length; index++) {
                let nextSource = arguments[index];

                if (nextSource !== null) { // Skip over if undefined or null
                    for (let nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
        writable: true,
        configurable: true
    });
}

class Events {

    /**
     * Creates a new instance of Events.
     *
     * @param args
     */
    constructor(args) {

        // Events render container
        if (args.container) {
            this.container = document.querySelector(args.container);
        }
        else {
            let c = document.createElement('div');
            c.id = 'events';
            document.body.appendChild(c);
            this.container = document.querySelector('#events');
        }

        // API url
        this.api = 'https://iasievents.ro/api/events/';

        // Event filtering
        this.filters = {

            // Venue
            venue: null,

            // Search keyword/phrase
            search: null,

            // Publisher profile
            publisher: null
        };

        // Extend filters
        this.filters = Object.assign(this.filters, args);
    }

    /**
     * Performs HTTP request.
     *
     * @param args
     */
    static httpRequest(args) {

        // Empty callback method
        let empty = () => {
        };

        // Default options
        let options = {
            method: 'GET',
            success: empty,
            warning: empty,
            error: empty,
            data: null
        };

        // Extend default options
        options = Object.assign(options, args);

        // Validate url
        if (options.url === undefined) {
            throw new Error('[httpRequest] URL missing.');
        }

        // Create XHR request
        let request = (window.ActiveXObject) ?
            new ActiveXObject('Microsoft.XMLHTTP') : (window.XMLHttpRequest) ? new XMLHttpRequest() : false;

        request.open(options.method, options.url, true);

        // POST or PUT request
        if (options.method === 'POST' || options.method === 'PUT') {
            request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }

        // Set callbacks
        request.onload = () => {

            // Success!
            //
            if (request.readyState === 4 && request.status === 200) {
                options.success(request.responseText);
            }

            // Reached destination, but error has been returned
            else {
                options.warning();
            }
        };

        request.onerror = options.error();

        // Send payload
        request.send(options.data);
    }

    /**
     * Get API generated URL.
     *
     * @param args
     * @return {string}
     */
    getUrl(args = {}) {

        // Build query string
        let queryString = Object.keys(args).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(args[k])).join('&');

        // Venue filter
        if (this.filters.venue) {
            return `${this.api}venue/${this.filters.venue}/?${queryString}`;
        }

        // Publisher filter
        else if (this.filters.publisher) {
            return `${this.api}publisher/${this.filters.publisher}/?${queryString}`;
        }

        // Search filter
        else if (this.filters.search) {
            return `${this.api}search/${this.filters.search}/?${queryString}`;
        }

        // No filters
        else {
            return `${this.api}search/?${queryString}`;
        }
    }

    /**
     * Fetch events happening in Iași
     */
    fetch(args, success) {

        // Success handler
        let handler = events => {
            return events.map(i => {
                return `<div><img src="${i.cover}"/><h3><a href="${i.url}">${i.name}</a></h3></div>`;
            }).join('');
        };

        // Perform HTTP request
        Events.httpRequest({
            url: this.getUrl(args),
            success: r => {
                // Validate response
                if (!r) {
                    throw new Error('Missing API response.');
                }

                // Parse JSON
                const json = JSON.parse(r);

                // Server error
                if (json.error) {
                    throw new Error(json.message);
                }

                // Validate events
                if (json.events) {
                    this.container.innerHTML = success ? success(json.events) : handler(json.events);
                }
            }
        });
    }
}