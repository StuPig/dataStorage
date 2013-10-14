/*jslint debug: true,
 undef: false */
;(function(win, doc){
    var localStorageName = 'localStorage';
    var _util = {
        isLocalStorageNameSupported: function() {
            // 加try{}catch(){}的为了防止Firefox浏览器改配置dom.Storage = false时crash掉
            try { return (localStorageName in win && win[localStorageName]) }
            catch(err) { return false }
        },
        // 判断是否是function
        isFunction: function(val) {
            return Object.prototype.toString.call(val) === "[object Function]";
        }
    };

    var dataStorage = function() {
        var DS = {},
            keyPrefix = '__ds_key__',
            expirePrefix = '__ds_expire__',
            storage,
            storedKeys = [];

        if (!_util.isLocalStorageNameSupported()) return;
        storage = win[localStorageName];

        // 获取key
        var getKey = function(key) {
            return { k: this.getKeyPrefix() + key, e: this.getExpPrefix() + key }
        };

        return {
            // 写入指定key的val值
            set: function(key, val, ms) {
                var kPair = getKey.call(this, key),
                    tarSize = (val || '').length,
                    that = this,
                    ePref = that.getExpPrefix(),
                    expireKey, realKey, storedKey;

                if (typeof val === 'undefined') return that.remove(key);
                try {
                    if (ms) storage.setItem(kPair.e, Date.now() + ms);
                    storage.setItem(kPair.k, that.serialize(val));
                } catch (e) {
                    if (e.name === 'QUOTA_EXCEEDED_ERR' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.name === 'QuotaExceededError') {

                        if (!storedKeys.length) {
                            for (var i = 0, l = localStorage.length; i < l ; i++) {
                                expireKey = localStorage.key(i);

                                if (expireKey && expireKey.indexOf(ePref) === 0 && (realKey = expireKey.replace(ePref, ''))) {
                                    storedKeys.push({
                                        k: realKey,
                                        e: storage.getItem(expireKey),
                                        s: (that.get(realKey) || '').length
                                    });
                                } else {
                                    continue;
                                }
                            }

                            storedKeys.sort(function(a, b) {
                                return (b.e - a.e);
                            });
                        }

                        while (storedKeys.length && tarSize > 0) {
                            storedKey = storedKeys.pop();
                            that.remove(storedKey.k);
                            tarSize -= storedKey.s;
                        }

                        if (ms) storage.setItem(kPair.e, Date.now() + ms);
                        storage.setItem(kPair.k, that.serialize(val));
                    }
                }
            },
            // 读取指定的key的val
            get: function(key, enableDes) {
                var kPair = getKey.call(this, key),
                    val = storage.getItem(kPair.k),
                    expire = storage.getItem(kPair.e);

                if (expire && Number(expire) < Date.now()) {
                    this.remove(key);
                    return undefined;
                } else if (enableDes) {
                    return this.deserialize(storage.getItem(kPair.k));
                } else {
                    return storage.getItem(kPair.k);
                }
            },
            // 清空整个data storage
            clear: function() {
                storage.clear();
            },
            // 读取所有的
            getAll: function() {
                var ret = {};
                for (var i = storage.length - 1; i >= 0; i--) {
                    var key = storage.key(i);
                    ret[key] = this.get(key, true);
                }
                return ret;
            },
            // 删除指定key
            remove: function(key) {
                var kPair = getKey.call(this, key);
                storage.removeItem(kPair.e);
                storage.removeItem(kPair.k);
            },
            /**
             * 读取指定类型的数据，并对读取的数据做初始化处理，之后写入
             * @param  {String} key
             * @param  {[default value]} defaultVal    [可选参数] 如果读取key的返回值为空的话，默认设置的value，默认是{}
             * @param  {Function} transactionFn 对所读取的数据，作何处理
             */
            transact: function(key, defaultVal, transactionFn) {
                var val = this.get(key)
                if (transactionFn == null) {
                    transactionFn = defaultVal;
                    defaultVal = null;
                }
                if (typeof val == 'undefined') { val = defaultVal || {} }
                this.set(key, transactionFn(val));
            },
            serialize: function(val) {
                return (typeof val === 'string' ? val : JSON.stringify(val));
            },
            deserialize: function(val) {
                if (typeof val != 'string') return undefined;
                return JSON.parse(val);
            },
            setKeyPrefix: function(prefix) {
                return this.keyPrefix = prefix;
            },
            getKeyPrefix: function() {
                return this.keyPrefix ? this.keyPrefix : keyPrefix;
            },
            setExpPrefix: function(prefix) {
                return this.expirePrefix = prefix;
            },
            getExpPrefix: function() {
                return this.expirePrefix ? this.expirePrefix : expirePrefix;
            }
        };
    };

    if (typeof module != 'undefined' && _util.isFunction(module)) {
        module.exports = dataStorage();
    } else if ( typeof define !== 'undefined' && _util.isFunction(define) && define.amd) {
        define(dataStorage());
    } else {
        this.dataStorage = dataStorage();
    }

})(window, document);
