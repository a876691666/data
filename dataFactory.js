
(function(window) {
    var dataFactory = window.dataFactory = function(options){

    }

    dataFactory.prototype.start = function (modelStr) {
        this.model = this.decompose(modelStr);
        return this.machining(this.model);
    }



    dataFactory.prototype.decompose = function (modelStr) {
        if(!modelStr) return;
        modelStr = this.trim(modelStr);
        var type = this.decompose_getType(modelStr);
        var value = this.decompose_getValue(type, modelStr);
        return {
            type:type,
            value:value
        }
    }

    dataFactory.prototype.decompose_getType = function  (modelStr) {
        var type;
        if(modelStr[0] === '[') {
            type = 'array'; 
        }else if(modelStr[0] === '{') {
            type = 'object';
        }else if(modelStr[0] === '\'') {
            type = 'string';
        }else if(modelStr[0] === '\"') {
            type = 'string';
        }else if(modelStr.indexOf('true') === 0) {
            type = 'boolean';
        }else if(modelStr.indexOf('false') === 0) {
            type = 'boolean';
        }else if('0123456789'.indexOf(modelStr[0]) != -1) {
            type = 'number';
        }else if(modelStr.indexOf('...') === 0){
            type = 'repeat';
        }else{
            type = 'string'
        }
        return type
    }

    dataFactory.prototype.decompose_getValue = function  (type, modelStr) {
        modelStr = this.trim(modelStr);
        if(type == 'array') {
            return this.decompose_array(modelStr.substr(1, modelStr.length-2));
        }
        if(type == 'object') {
            return this.decompose_object(modelStr.substr(1, modelStr.length-2));
        }
        if(type == 'number') {
            return modelStr;
        }
        if(type == 'boolean'){
            return modelStr;
        }
        if(type == 'repeat'){
            return modelStr.substr(3);
        }
        if(type == 'string'){
            return modelStr;
        }
    }

    dataFactory.prototype.decompose_array = function  (modelStr) {
        var list = [];

        var str = modelStr;
        var depth = 0;
        var group = '';
        for(var i = 0; i<str.length;i++){
            var s = str[i];
            group += s;
            if(s == '[' || s == '{') depth +=1;
            if(s == '}' || s == ']') depth -=1;
            if(depth == 0 && (str[i+1] == ',' || i == str.length -1)){
                i+=1
                list.push(this.decompose(group));
                group = '';
            }
        }

        return list;
    }

    dataFactory.prototype.decompose_object = function  (modelStr) {
        var list = [];

        var str = modelStr;
        var depth = 0;
        var strDepth = 0;
        var key = '';
        var value = '';
        var iskey = true;
        for(var i = 0; i<str.length;i++){
            var s = str[i];
            if(iskey){
                if(s == ':') {
                    iskey = false;
                    continue;
                }
                key+=s;
            }else{
                value+=s;
                if(s == '[' || s == '{') depth +=1;
                if(s == '}' || s == ']') depth -=1;
                if(depth == 0 && (str[i+1] == ',' || i == str.length -1)){
                    i+=1;
                    list.push({
                        key:this.trim(key),
                        value:this.decompose(value)
                    })
                    key = value = '';
                    iskey = true;
                }
            }
        }
        return list;
    }

    dataFactory.prototype.trim = function  (str) {
        if(!str || !str.replace) return;
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }


    dataFactory.prototype.machining = function  (model) {
        return this[model.type+'Factory'](model.value);
    }



    dataFactory.prototype.stringFactory = function  (value) {
        if(value == /%b%/) return this.randomBooleanFactory();
        if(value.indexOf('/%') != -1){
            var blist = [];
            var b = '';
            var bflag;
            var v = '';
            var index = 0;
            for(var i = 0;i<value.length;i++){
                if(value[i] + value[i+1] == '%/') bflag = false, blist.push(b), b = '', v+=(index++);
                if(bflag){
                    b+=value[i];
                }else{
                    v+= value[i]
                }
                if(value[i-1] + value[i] == '/%') bflag = true;
            }
            for(var i in blist){
                if(blist[i].indexOf('-')!=-1) {
                    v = v.replace('/%'+i+'%/', this.randomFactory.apply(this, blist[i].split('-')))
                }
                if(blist[i] == 'b'){
                    v = v.replace('/%'+i+'%/', this.randomBooleanFactory())
                }
            }
            return v;
        }
        return value;
    }
    dataFactory.prototype.numberFactory = function  (value) {
        return this.stringFactory(value) * 1;
    }
    dataFactory.prototype.objectFactory = function  (value) {
        var obj = {};
        for(var i in value){
            var key = this.stringFactory(value[i].key);
            obj[key] = this[value[i].value.type + 'Factory'](value[i].value.value)
        }

        return obj;
    }
    dataFactory.prototype.booleanFactory = function  (value) {
        return value === 'true';
    }
    dataFactory.prototype.arrayFactory = function  (value) {
        var arr = [];

        for(var i = 0;i<value.length;i++){
            if(value[i].type == 'repeat'){
                if(i==0) continue;
                for(var index = 0; index < this.stringFactory(value[i].value) - 1; index ++){
                    arr.push(this[value[i-1].type + 'Factory'](value[i-1].value))
                }
                continue;
            }
            arr.push(this[value[i].type + 'Factory'](value[i].value))
        }

        return arr;
    }
    dataFactory.prototype.randomFactory = function  (start, end) {
        var space = end - start;
        return (start * 1 + Math.random() * space).toFixed(0);
    }
    dataFactory.prototype.randomBooleanFactory = function  () {
        return (Math.random()*100).toFixed(0) % 2 == 1;
    }
})(window)