
(function (global) {
  // 'use strict';
  // Export
  function toFixed(number, precision = 2) {
    const baseNumber = eval(`1e${precision}`);
    return Math.round(number * baseNumber) / baseNumber;
  }

  function trigger(val) {
    if (typeof val === 'function') {
      return val();
    }
    if (Array.isArray(val)) {
      return factory.Array(val);
    }
    if (typeof val === 'object') {
      return factory.Object(val);
    }
    return val;
  }
  class Random {
    number = (left = 0, right = 1, precision = 2) => _ => {
      return toFixed(Math.random() * (right - left) + left, precision);
    }
    str = (keys, len) => _ => {
      const randomFunc = random.number(0, len, 0);
      return Array.from(new Array(len)).map(_ => keys[randomFunc()]).join('');
    }
  }

  class Factory {
    List(baseItem, number = 0) {
      const list = Array.from(new Array(number));
      return list.map((_, index) => {
        return trigger(baseItem)
      });
    }

    Object(obj) {
      const keys = Object.keys(obj);
      const newObj = {};
      keys.forEach(item => {
        newObj[item] = trigger(obj[item]);
      });
      return newObj;
    }

    Array(list) {
      return list.map(item => trigger(item));
    }
  }

  class DataFactory {
    constructor(props) {
      this.Factory = props.factory;
      this.Random = props.random;
    }
  }

  const factory = new Factory();
  const random = new Random();
  const dataFactory = new DataFactory({
    factory,
    random,
  });

  //AMD.
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return dataFactory;
    });

    // Node and other CommonJS-like environments that support module.exports.
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = dataFactory

    //Browser.
  } else {
    global.DataFactory = dataFactory;
  }

})(this);