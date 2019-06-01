# events.js for site owners
#### Easily fetch events from [IAȘI events](https://iasievents.ro) platform and display them on your website.

### Usage
```js
const events = new Events(args);
events.fetch(args, callback);
```

### Constructor arguments
```js
new Events({

    // Container to render fetched eventsw
    // If missing, events will be rendered in a new <div> element
    container: '#events',
    
    // Fetch all events containing search keyword/phrase
    search: 'keywords',
    
    // Fetch all events published under a given profile
    publisher: 1,
    
    // Fetch all events organized at a given venue
    venue: 'venue'
    
});
```

### Custom callback
```js
events.fetch({}, events => {
    return events.map(i => {
        return `<div><img src="${i.cover}"/><h3><a href="${i.url}">${i.name}</a></h3></div>`;
    }).join('');
});
```