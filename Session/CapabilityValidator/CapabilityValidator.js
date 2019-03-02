const validator = require('validator');
const ping = require('ping');
const isPortReachable = require('is-port-reachable');
const { BadRequest } = require('../../Error/errors');
const util = require('../../utils/utils');

class CapabilityValidator {
  constructor(capability, capabilityName) {
    this.validate(capability, capabilityName);
  }

  validate(capability, capabilityName) {
    switch (capabilityName) {
      case 'browserName':
      case 'browserVersion':
      case 'platformName':
        if (!util.validate.type(capability, 'string')) throw new BadRequest('invalid argument');
        this[capabilityName] = capability;
        break;
      case 'acceptInsecureCerts':
        if (!util.validate.type(capability, 'boolean')) throw new BadRequest('invalid argument');
        this[capabilityName] = capability;
        break;
      case 'pageLoadStrategy':
        if (!util.validate.type(capability, 'string')) throw new BadRequest('invalid argument');
        if (
          capability !== 'none'
          || capability !== 'eager'
          || capability !== 'normal') throw new BadRequest('invalid argument');
        this[capabilityName] = capability;
        break;
      case 'unhandledPromptBehaviour':
        if (!util.validate.type(capability, 'string')) throw new BadRequest('invalid argument');
        if (
          capability !== 'dismiss'
          || capability !== 'accept'
          || capability !== 'dismiss and notify'
          || capability !== 'accept and notify'
          || capability !== 'ignore'
        ) throw new BadRequest('invalid argument');
        this[capabilityName] = capability;
        break;
      case 'proxy':
        if (!util.validate.type(capability, 'object')) throw new BadRequest('invalid argument');
        this.setProxy(capability);
        break;
      case 'timeouts':
        // TODO: timeouts capability validation
        break;
      default:
        break;
    }
  }

  setTimeouts(timeouts) {

  }

  setProxy(reqProxy) {
    const proxyProperties = [
      'proxyType',
      'proxyAutoConfig',
      'ftpProxy',
      'httpProxy',
      'noProxy',
      'sslproxy',
      'socksProxy',
      'socksVersion',
    ];

    const proxy = {};

    proxyProperties.forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(reqProxy, key)) {
        throw new BadRequest('invalid argument');
      } else {
        switch (key) {
          case 'proxyType':
            if (reqProxy[key] === 'pac') { // this portion of code could be written more cleanly...
              if (!Object.prototype.hasOwnProperty.call(reqProxy, 'proxyAutoConfig')) {
                throw new BadRequest('invalid argument');
              }
              proxy[key] = reqProxy[key];
            } else if (
              reqProxy[key] !== 'direct'
              || reqProxy[key] !== 'autodetect'
              || reqProxy[key] !== 'system'
              || reqProxy[key] !== 'manual'
            ) throw new BadRequest('invalid argument');
            else {
              proxy[key] = reqProxy[key];
            }
            break;
          case 'proxyautoConfigUrl':
            if (!validator.isURL(reqProxy[key])) throw new BadRequest('invalid argument');
            else proxy[key] = reqProxy[key];
            break;
          case 'ftpProxy':
          case 'httpProxy':
          case 'sslProxy':
            if (proxy.proxyType === 'manual') {
              const proxy = CapabilityValidator.validateHost(reqProxy[key]);
              if (proxy) proxy[key] = reqProxy[key];
              else throw new BadRequest('invalid argument');

            }
            break;
          case 'socksProxy':
            if (proxy.proxyType === 'manual') {
              if (!Object.prototype.hasOwnProperty.call(reqProxy, 'socksVersion')) {
                throw new BadRequest('invalid argument');
              } else {
                const proxy = CapabilityValidator.validateHost(reqProxy[key]);
                if (proxy) proxy[key] = reqProxy[key];
                else throw new BadRequest('invalid argument');
              }
            }
            break;
          case 'socksVersion':
            if (proxy.proxyType === 'manual') {
              if (Number.isInteger(reqProxy[key]) && reqProxy[key] > -1 && reqProxy[key] < 256) {
                proxy[key] = reqProxy[key];
              } else throw new BadRequest('invalid argument');
            }
            break;
          default:
            throw new BadRequest('invalid argument');
        }
      }
    });
    this.proxy = proxy;
  }

  static validateHostAndPort(host) {
    let validHost;

    ping.sys.probe(host, (isAlive) => {
      validHost = isAlive ? true : false;
    });

    if (validHost) {
      return host;
    }
    return false;
  }
}

module.exports = CapabilityValidator;
