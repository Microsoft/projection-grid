import _ from 'underscore';
import renderersPlugin from './renderers-plugin';
import projectionPlugin from './projection-plugin';
import gridViewPlugin from './grid-view-plugin';

import dataSourceVNextPlugin from '../vnext/factory/data-source-plugin.js';
import gridViewVNextPlugin from '../vnext/factory/grid-view-plugin.js';

const configPlugin = definePlugin => definePlugin('config', [], function () {
  return this.config;
});

class GridFactory {
  constructor({
    vnext = false,
  } = {}) {
    this.pluginIndex = {};
    this.plugins = [];
    if (vnext) {
      this
        .use(configPlugin)
        .use(dataSourceVNextPlugin)
        .use(gridViewVNextPlugin);
    } else {
      this
        .use(configPlugin)
        .use(projectionPlugin)
        .use(renderersPlugin)
        .use(gridViewPlugin);
    }
  }

  definePlugin(name, deps, callback) {
    const plugin = { name, deps, callback };

    this.pluginIndex[name] = plugin;
    this.plugins.push(plugin);
    _.each(deps, dep => {
      if (!_.has(this.pluginIndex, dep)) {
        throw new Error(`unresolved plugin dependency ${name} -> ${dep}`);
      }
    });
  }

  use(callback) {
    callback(this.definePlugin.bind(this));
    return this;
  }

  create(config) {
    return _.reduce(
      this.plugins,
      (result, { name, deps, callback }) =>
        _.extend(result, {
          [name]: callback.apply(result, _.map(deps, dep => result[dep])),
        }),
      { config }
    );
  }

}

export default function (options) {
  return new GridFactory(options);
}
