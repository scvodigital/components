import MDCFoundation from '@material/base/foundation';
import SMCAjaxButtonAdapter from './adapter';
import domManipulator from '../dom-manipulator';
import * as jsonLogic from 'json-logic-js';
import 'whatwg-fetch';
import 'babel-polyfill';

class SMCAjaxButtonFoundation extends MDCFoundation {
  static get strings() {
    return {};
  }

  static get cssClasses() {
    return {};
  }

  static get defaultAdapter() {
    return ({
      notifyInteraction: () => {}
    });
  }

  get stateName() {
    return this.adapter_.root.getAttribute('data-ajax-state') || null;
  }

  set stateName(newState) {
    this.adapter_.root.setAttribute('data-ajax-state', newState);
  }

  get stateConfig() {
    if (this.adapter_.config.states) {
      if (this.adapter_.config.states[this.stateName]) {
        return this.adapter_.config.states[this.stateName];
      } else {
        return this.adapter_.config.states[Object.keys(this.adapter_.config.states)[0]];
      }
    } else {
      return this.adapter_.config;
    }
  }

  constructor(adapter) {
    super(Object.assign(SMCAjaxButtonFoundation.defaultAdapter, adapter));
    
    if (this.stateConfig.initial) {
      const context = { config: this.stateConfig };
      domManipulator(this.stateConfig.initial, this.adapter_.root, context);
    }
  }

  handleInteraction(evt) {
    if (evt.type === 'click' || evt.key === 'Enter' || evt.keyCode === 13) {
      this.doAjax().then(() => {
        this.adapter_.notifyInteraction();
      })
    }
  }

  async doAjax() {
    const root = this.adapter_.root;
    const config = JSON.parse(JSON.stringify(this.stateConfig));
    const method = config.method && config.method.toUpperCase() || 'GET';
    const options = {
      method: method,
      dataType: config.responseType || 'html',
      data: config.postBody || undefined
    };

    if (config.before) {
      domManipulator(config.before, root, { config, options }); 
    }

    let response, body, error;
    try {
      response = await fetch(config.url, options)
      
      if (config.responseType.indexOf('json') > -1) {
        body = await response.json();
      } else {
        body = { text: await response.text() };
      }
      
      if (config.success) {
        const context = { config, options, body };
        domManipulator(config.success, root, context);
      }
    } catch(err) {
      console.error('Failed to Ajax', err);
      error = err;
      if (config.error) {
        const context = { config, options, body };
        domManipulator(config.error, root, context); 
      }
    }

    if (typeof config.newState === 'string') {
      this.stateName = config.newState;
    } else if (typeof config.newState === 'object') {
      const context = { config, options, body, error };
      const output = jsonLogic.apply(config.newState, context);
      this.stateName = output;
    }

    if (this.stateConfig.initial) {
      const context = { config: this.stateConfig, options, body };
      domManipulator(this.stateConfig.initial, root, context);
    }

    if (config.after) {
      const context = { config, options, body };
      domManipulator(config.after, root, context);
    }
  }
}

export default SMCAjaxButtonFoundation;