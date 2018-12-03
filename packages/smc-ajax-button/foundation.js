import MDCFoundation from '@material/base/foundation';
import SMCAjaxButtonAdapter from './adapter';

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

  constructor(adapter) {
    super(Object.assign(SMCAjaxButtonFoundation.defaultAdapter, adapter));
  }

  handleInteraction(evt) {
    console.log('handleInteraction', evt);
    if (evt.type === 'click' || evt.key === 'Enter' || evt.keyCode === 13) {
      this.adapter_.notifyInteraction();
    }
  }
}

export default SMCAjaxButtonFoundation;