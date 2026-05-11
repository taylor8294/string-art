async function loadScriptsOneAfterAnother(filenames, type='text/javascript'){
    for(let filename of filenames){
        await loadScript('./src/Page/' + filename, type);
    }
}

async function loadScript(filename, type='text/javascript'){
    return new Promise((resolve, reject) => {
        var script = document.createElement("script");
        script.type = type;
        script.src = filename;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

loadScriptsOneAfterAnother([
    'Error.js',
    'Helpers/Utils.js',
    'Helpers/URL.js',
    'Helpers/Events.js',
    'Helpers/Cache.js',
    'Helpers/Storage.js',
    'Controls.js',
    'Sections.js',
    'FileControl.js',
    'Tabs.js',
    'Range.js',
    'Checkbox.js',
    'Canvas.js'
]).then(() => {
    loadScript('./src/main.js', 'module');
});