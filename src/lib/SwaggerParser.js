


class SwaggerParser {

    static parse(json) {
        var methods = [],
                api;
            console.log(json);
            api = json;
        
        Object.keys(api.paths).forEach(function(url, i) {
            ['get', 'post', 'put', 'delete'].forEach(function(verb) {
                var m = api.paths[url][verb];
                if (m) {
                    m.verb = verb;
                    m.path = url;
                    m.key = `${m.verb}-${m.path}-${i}`.replace(/[^a-z0-9]+/ig, '-').toLowerCase();
                    methods.push(m);
                }
            });
        });

        api.methods = methods.sort(function(a, b) {
            if (a.path < b.path) return -1;
            else if (b.path < a.path) return 1;
            else return (a.verb < b.verb) ? 1 : -1;
        });

        Object.keys(api.definitions).forEach(function(name) {
            if (api.definitions[name].$ref) {
                var match = /#\/definitions\/(.*)$/.exec(api.definitions[name].$ref);
                if (match[1] && api.definitions[match[1]]) {
                    api.definitions[name] = api.definitions[match[1]];
                }
            }
        });

        return api;
    }
}




export default SwaggerParser;