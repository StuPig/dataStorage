dataStorage
===========

Another localStorage wrapper provides easy-to-use API and focuses on safely IO with localStorage's limited capacity.

又一个localStorage的封装，提供简单易用的API，专注于localStorage安全的IO操作。

###API
#####set(key, val, exp)
**arguments**
key: {String} key
val: {String|Object} value
exp: [optional] an expired time relative to now

**demo**
```javascript
    // normal
    dataStorage.set('name', 'StuPig');

    // with expire time
    dataStorage.set('name', 'StuPig', 5000);    // expired after 5s

    // set an Object
    dataStorage.set('me', {name: StuPig});
```

####get(key, enableDes)
**arguments**
key: {String} key
enableDes: {Boolean} [optional] whether to enable deseriablize the result item get from localStorage. If the result is an JSON string, then we recomend this param to be true;

**demo**
```javascript
    // normal
    dataStorage.get('name');    // StuPig

    // enable deseralize result
    dataStorage.get('me', true);    // { name: StuPig }
```

####clear
clear localStorage

**demo
```javascript
    dataStorage.clear();
```

####getAll
get all localStorage items, return Object

**demo
```javascript
    dataStorage.getAll();
```

####remove
remove an item

**demo
```javascript
    dataStorage.remove('name');
```

####transact
if the item not exist and with default value, then set it with a default value.
if the item exists, then update it with special operation.

**arguments
key: {String} key
defaultVal: {String|Object} [optional] the default value
transactionFn: {Function} the trasaction function

**demo
```javascript
    // update the value
    dataStorage.transact('name', 'StuPid', function(val) {
        return val + 'balabala';
    });     // name: StuPidbalabala

    // update the value
    dataStorage.transact('notexist', function(val) {
        return Date.now();
    });     // notexist: 1381754727947
```

####setKeyPrefix
set the key prefix to seperate different key-vals in the same domain
default value is '__ds_key__'

**arguments
prefix: {String} the key prefix

**demo
```javascript
    dataStorage.setKeyPrefix('__bucket00__');
    // then set a item
    dataStorage.set('name', 'StuPig');  // the real key will be '__bucket00__name'
    localStorage.getItem('__bucket00__name') === 'StuPig';  // true
```

####getKeyPrefix
return the key prefix config in current page

**demo
```javascript
    dataStorage.getKeyPrefix();     // '__bucket00__'
```

####getExpPrefix
set the expired key prefix to seperate different key-vals in the same domain
default value is '__ds_expire__'

**arguments
prefix: {String} the key prefix

**demo
```javascript
    dataStorage.setExpPrefix('__bucket01__');
    // then set a item
    dataStorage.set('name', 'StuPig', 5000);  // the expired key will be '__bucket01__name'
    localStorage.getItem('__bucket01__name') == (Date.now() + 5000);  // mostly will be true
```

####getExpPrefix
return the expired key prefix config in current page

**demo
```javascript
    dataStorage.getExpPrefix();     // '__bucket01__'
```


