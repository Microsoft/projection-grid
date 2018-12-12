import _ from 'underscore';
import pGrid from 'component/grid';
import chai from 'chai';
import util from 'util';
import rawData from 'data/people.json';
import driver from 'driver';
import Promise from 'bluebird';
import Backbone from 'backbone';

/* eslint-disable no-unused-expressions */

let expect = chai.expect;
let selectedKeys = ['UserName', 'FirstName', 'LastName', 'Gender', 'Concurrency'];
let memoryData = _.map(rawData.value, row => _.pick(row, selectedKeys));

class TitleView extends Backbone.View {
  initialize({ title }) {
    this.title = title;
  }
  render() {
    this.$el.html(`<h2>${this.title}</h2>`);
    return this;
  }
}

let gridConfig = {
  el: '#container',
  dataSource: {
    type: 'memory',
    data: memoryData,
    primaryKey: 'UserName',
  },
  rows: {
    headRows: [{
      html: '<div class="head-rows-html">head rows html</div>',
      payload: 'Custom Row',
      attributes: {
        'data-type': 'html',
        'data-payload': _.property('payload'),
      },
    }, 'column-header-rows'],
    bodyRows: [
      {
        type: 'data-rows',
        classes: {
          male: row => (row.Gender === 'Male'),
          female: row => (row.Gender === 'Female'),
        },
        attributes: {
          'data-type': 'data',
          'data-first-name': _.property('FirstName'),
        },
      },
    ],
    footRows: [{
      view: new TitleView({ title: 'view in footer' }).render(),
      attributes: {
        'data-type': 'view',
        'data-title': ({ view }) => view.title,
      },
    }],
  },
};

let pgrid, gridView;

describe('rows config', function () {
  beforeEach(function () {
    util.renderTestContainer();
    pgrid = pGrid.factory({ vnext: true }).create(gridConfig);
    gridView = pgrid.gridView;
    return new Promise(resolve => gridView.render(resolve))
      .then(() => driver.once(gridView, 'didUpdate'));
  });

  afterEach(() => {
    gridView.remove();
    util.cleanup();
  });

  it('rows should works as expected in header & footer', function () {
    return Promise
      .all([
        driver.element('#container > .table-container .header tr'),
        driver.element('#container > .table-container .header tr:nth-child(1) .head-rows-html'),
        driver.element('#container > .table-container .header tr:nth-child(2) th'),
        driver.element('#container > .table-container .footer tr td div h2'),
      ])
      .then(result => {
        expect(result[0].length).to.be.equal(2);
        expect(result[1].text()).to.be.equal('head rows html');
        let assertion = util.validateElementMatrix(result[2], selectedKeys);
        expect(assertion).to.be.true;
        expect(result[3].text()).to.be.equal('view in footer');
      })
      .tapCatch(console.log);
  });

  it('rows should works as expected in body', function () {
    return driver.element('.table-container table tbody tr[data-key]')
      .then(result => {
        util.validateClassesForElementArray([result.eq(0), result.eq(4), result.eq(9)], ['male']);
        util.validateClassesForElementArray([result.eq(10), result.eq(13), result.eq(15)], ['female']);
      })
      .tapCatch(console.log);
  });

  it('should render the attributes of TRs correctly', function () {
    return driver
      .element('.table-container table > thead > tr[data-type="html"]')
      .then(result => {
        expect(result.length).to.equal(1);
        expect(result.attr('data-payload')).to.equal('Custom Row');
      })
      .then(() => driver.element('.table-container table > tbody > tr[data-key]:eq(0)'))
      .then(result => {
        expect(result.length).to.equal(1);
        expect(result.attr('data-type')).to.equal('data');
        expect(result.attr('data-first-name')).to.equal(_.first(memoryData).FirstName);
      })
      .then(() => driver.element('.table-container table > tfoot > tr[data-type="view"]'))
      .then(result => {
        expect(result.length).to.equal(1);
        expect(result.attr('data-title')).to.equal('view in footer');
      })
      .tapCatch(console.log);
  });
});
