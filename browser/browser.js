

const jsdom = require('jsdom');
const tough = require('jsdom').toughCookie;

const { JSDOM } = jsdom;
const ELEMENT = 'element-6066-11e4-a52e-4f735466cecf';

const { NoSuchElement } = require('../Error/errors');

class Browser {
  constructor(options) {
    this.dom = new JSDOM();
    this.options = options; // in the future this will be replaced by a default config file
    this.knownElements = [];
  }

  async navigateToURL(URL) {
    if (URL) {
      this.dom = await JSDOM.fromURL(URL);
    }
    return true;
  }

  getTitle() {
    return this.dom.window.document.title;
  }

  getURL() {
    return this.dom.window.document.URL;
  }

  getCookies() {
    let cookies;

    this.dom.cookieJar.store.getAllCookies((err, foundCookies) => {
      if (err) throw err;
      cookies = foundCookies;
    });

    console.log(cookies[0]);

    // cookies.forEach((cookieObject) => {
    //   Object.defineProperty(cookieObject, 'name', {
    //     value: cookieObject.key,
    //     writable: false,
    //     enumerable: true,
    //   });

    //   Object.defineProperty(cookieObject, 'expiry', {
    //     value: cookieObject.expires,
    //     writable: false,
    //     enumerable: true,
    //   });
    //   delete cookieObject.key;
    //   delete cookieObject.expires;
    // });

    return cookies;
  }

  // TODO: function contains basic functionality, check standard and make compliant
  getKnownElement(id) {
    let foundElement = null;
    this.knownElements.forEach((element) => {
      if (element[ELEMENT] === id) foundElement = element;
    });
    if (!foundElement) throw new NoSuchElement();
    return foundElement;
  }

  close() {
    this.dom.window.close();
  }
}

module.exports = Browser;
