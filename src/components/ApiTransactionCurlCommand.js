import React, { Component } from 'react';


export default class ApiTransactionCurlCommand extends Component {


    getCurlCommand(args1, args2) {
        
        let xhr = this.props.xhr;
        let results = [];
        let obj = xhr.request.options;
        let isFormData = false;
        let isMultipart = false;

        results.push('-X ' + this.method.toUpperCase());

        Object.keys(obj.headers || {}).forEach((key) => {

            let value = obj.headers[key];
            if (typeof value === 'string') {
                value = value.replace(/\'/g, '\\u0027');
            }
            results.push('--header \'' + key + ': ' + value + '\'');

        });

        let type = obj.headers['Content-Type'];
        
        if (type && type.indexOf('application/x-www-form-urlencoded') === 0) {
            isFormData = true;
        } else if (type && type.indexOf('multipart/form-data') === 0) {
            isFormData = true;
            isMultipart = true;
        }

        let body = this.getBodyContent({ isFormData, isMultipart, results });

        return 'curl ' + (results.join(' ')) + ' \'' + xhr.responseURL + '\'';

    }


    appendBodyString({ isMultipart, isFormData, results }) {

        let body;

        if (typeof this.props.xhr.data != "string") {
            body = this.stringifyBody();
        } else {
            body = this.props.xhr.data;
        }

        // escape @ => %40, ' => %27
        body = body.replace(/\'/g, '%27').replace(/\n/g, ' \\ \n ');

        if (!isFormData) {
            // escape & => %26
            body = body.replace(/&/g, '%26');
        }
        if (isMultipart) {
            results.push(body);
        } else {
            results.push('-d \'' + body.replace(/@/g, '%40') + '\'');
        }


    }

    stringifyBody({ body, isMultipart, isFormData, isJson }) {
        return JSON.stringify(body);
        // if (isMultipart) {
        //     return this.convertMultiPartBody({ body, isMultipart, isFormData, isJson });
        // } else {
        //     return JSON.stringify(body);
        // }
    }

    encodeMultiPartBody({ body, isMultipart, isFormData, isJson }) {

        for (var i = 0; i < body.length; i++) {

            var parameter = this.parameters[i];

            if (parameter.in === 'formData') {

                if (!body) {
                    body = '';
                }

                var paramValue;
                if (typeof FormData === 'function' && body instanceof FormData) {
                    paramValue = body.getAll(parameter.name);
                } else {
                    paramValue = body[parameter.name];
                }
                if (paramValue) {
                    if (parameter.type === 'file') {
                        if (paramValue.name) {
                            body += '-F ' + parameter.name + '=@"' + paramValue.name + '" ';
                        }
                    } else {
                        if (Array.isArray(paramValue)) {
                            if (parameter.collectionFormat === 'multi') {
                                for (var v in paramValue) {
                                    body += '-F ' + this.encodeQueryKey(parameter.name) + '=' + paramValue[v] + ' ';
                                }
                            } else {
                                body += '-F ' + this.encodeQueryCollection(parameter.collectionFormat, parameter.name, paramValue) + ' ';
                            }
                        } else {
                            body += '-F ' + this.encodeQueryKey(parameter.name) + '=' + paramValue + ' ';
                        }
                    }
                }
            }
        }
    }

    encodePathCollection(type, name, value) {
      var encoded = '';
      var i;
      var separator = '';

      if (type === 'ssv') {
        separator = '%20';
      } else if (type === 'tsv') {
        separator = '%09';
      } else if (type === 'pipes') {
        separator = '|';
      } else {
        separator = ',';
      }

      for (i = 0; i < value.length; i++) {
        if (i === 0) {
          encoded = this.encodeQueryParam(value[i]);
        } else {
          encoded += separator + this.encodeQueryParam(value[i]);
        }
      }

      return encoded;
    };

    encodeQueryCollection(type, name, value) {
      var encoded = '';
      var i;

      type = type || 'default';
      if (type === 'default' || type === 'multi') {
        for (i = 0; i < value.length; i++) {
          if (i > 0) {encoded += '&';}

          encoded += this.encodeQueryKey(name) + '=' + this.encodeQueryParam(value[i]);
        }
      } else {
        var separator = '';

        if (type === 'csv') {
          separator = ',';
        } else if (type === 'ssv') {
          separator = '%20';
        } else if (type === 'tsv') {
          separator = '%09';
        } else if (type === 'pipes') {
          separator = '|';
        } else if (type === 'brackets') {
          for (i = 0; i < value.length; i++) {
            if (i !== 0) {
              encoded += '&';
            }

            encoded += this.encodeQueryKey(name) + '[]=' + this.encodeQueryParam(value[i]);
          }
        }

        if (separator !== '') {
          for (i = 0; i < value.length; i++) {
            if (i === 0) {
              encoded = this.encodeQueryKey(name) + '=' + this.encodeQueryParam(value[i]);
            } else {
              encoded += separator + this.encodeQueryParam(value[i]);
            }
          }
        }
      }

        return encoded;
    }

    encodeQueryKey(arg) {
        return encodeURIComponent(arg)
                .replace('%5B','[')
                .replace('%5D', ']')
                .replace('%24', '$');
    }

    encodeQueryParam(arg) {
        return encodeURIComponent(arg);
    }

    encodePathParam(pathParam) {
        return encodeURIComponent(pathParam);
    }


    render() {
        try {
            return (
                <pre>{ this.getCurlCommand() }</pre>
            );
        } catch (e) {
            return (
                <pre>error when generating curl command</pre>
            );
        }
    }

}
