/**
 * Powercord, a lightweight @discordapp client mod focused on simplicity and performance
 * Copyright (C) 2018-2019  aetheryx & Bowser65
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const { randomBytes } = require('crypto');

const injector = {
  injections: [],

  inject: (injectionId, mod, funcName, patch, pre = false) => {
    if (!mod) {
      return injector._error(`Tried to patch undefined (Injection ID "${injectionId}")`);
    }

    if (injector.injections.find(i => i.id === injectionId)) {
      return injector._error(`Injection ID "${injectionId}" is already used!`);
    }

    if (!mod.__powercordInjectionId || !mod.__powercordInjectionId[funcName]) {
      // 1st injection
      const id = randomBytes(16).toString('hex');
      mod.__powercordInjectionId = Object.assign((mod.__powercordInjectionId || {}), { [funcName]: id });
      mod[funcName] = (_oldMethod => function (...args) {
        const finalArgs = injector._runPreInjections(id, args, this);
        if (finalArgs !== false && Array.isArray(finalArgs)) {
          const returned = _oldMethod ? _oldMethod.call(this, ...finalArgs) : void 0;
          return injector._runInjections(id, finalArgs, returned, this);
        }
      })(mod[funcName]);

      injector.injections[id] = [];
    }

    injector.injections.push({
      module: mod.__powercordInjectionId[funcName],
      id: injectionId,
      method: patch,
      pre
    });
  },

  uninject: (injectionId) => {
    injector.injections = injector.injections.filter(i => i.id !== injectionId);
  },

  _runPreInjections: (modId, originArgs, _this) => {
    const injections = injector.injections.filter(i => i.module === modId && i.pre);
    if (injections.length === 0) {
      return originArgs;
    }
    return injector._runPreInjectionsRecursive(injections, originArgs, _this);
  },

  _runPreInjectionsRecursive: (injections, originalArgs, _this) => {
    const injection = injections.pop();
    let args = injection.method.call(_this, originalArgs);
    if (args === false) {
      return false;
    }

    if (!Array.isArray(args)) {
      injector._error(`Pre-injection ${injection.id} returned something invalid. Injection will be ignored.`);
      args = originalArgs;
    }

    if (injections.length > 0) {
      return injector._runPreInjectionsRecursive(injections, args, _this);
    }
    return args;
  },

  _runInjections: (modId, originArgs, originReturn, _this) => {
    let finalReturn = originReturn;
    const injections = injector.injections.filter(i => i.module === modId && !i.pre);
    injections.forEach(i => {
      try {
        finalReturn = i.method.call(_this, originArgs, finalReturn);
      } catch (e) {
        injector._error(`Failed to run injection "${i.id}"`, e);
      }
    });
    return finalReturn;
  },

  _error: (...args) => {
    console.error('%c[Powercord:Injector]', 'color: #7289da', ...args);
  }
};

module.exports = injector;
