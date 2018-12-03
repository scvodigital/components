import MDCComponent from '@material/base/component';

import {SMCAjaxButtonAdapter} from './adapter';
import SMCAjaxButtonFoundation from './foundation';

const INTERACTION_EVENTS = ['click', 'keydown'];

class SMCAjaxButton extends MDCComponent {
  constructor(...args) {
    super(...args);

    this.id;
    this.config;
    this.handleInteraction_;
  }

  static attachTo(root) {
    return new SMCAjaxButton(root);
  }

  initialize() {
    this.id = this.root_.id;
    this.config = JSON.stringify(this.root_.getAttribute('data-config'));
  }

  initialSyncWithDOM() {
    this.handleInteraction_ = (evt) => this.foundation_.handleInteraction(evt);

    INTERACTION_EVENTS.forEach((evtType) => {
      this.root_.addEventListener(evtType, this.handleInteraction_);
    });
  }

  destroy() {
    INTERACTION_EVENTS.forEach((evtType) => {
      this.root_.removeEventListener(evtType, this.handleInteraction_);
    });

    super.destroy();
  }

  getDefaultFoundation() {
    return new SMCAjaxButtonFoundation((Object.assign({
      addClass: (className) => this.root_.classList.add(className),
      removeClass: (className) => this.root_.classList.remove(className),
      hasClass: (className) => this.root_.classList.contains(className),
      notifyInteraction: () => this.emit('SMCAjaxButton:interaction', {buttonId: this.id}, true),
      notifyRemoval: () => this.emit('SMCAjaxButton:removal', {buttonId: this.id, root: this.root_}, true),
      getComputedStyleValue: (propertyName) => window.getComputerStyle(this.root_).getPropertyValue(propertyName),
      setStyleProperty: (propertyName, value) => this.root_.style.setProperty(propertyName, value),
    })));
  }
}

export {SMCAjaxButton, SMCAjaxButtonFoundation};