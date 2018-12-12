import Promise from 'bluebird';
import protocol from './protocol';

function click(selector) {
  return protocol.element.call(this, selector)
    .then($el => {
      $el.click();
      return null;
    });
}

function setValue(selector, value) {
  return protocol.element.call(this, selector)
    .then(($el) => {
      $el.val(value).change();
      return null;
    });
}

export default {
  click,
  setValue,
};
