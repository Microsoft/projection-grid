import _ from 'underscore';
import { getDefaultColumns, extendColumns, extendDataColumnAttr } from './common.js';

/**
 * @typedef ColumnConfig
 * @type {Object}
 * @property {string} name
 *    Name of the column.
 * @property {string} title
 *    The localized column title. The `name` will be used if `title` is omitted.
 * @property {string} html
 *    The HTML string to be rendered in the column header. The `title` string
 *    will be rendered in the column header if `html` is omitted.
 * @property {(string|PropertyCallback|PropertyConfig)} property
 *    The data property of the column. It defines how to get/set values with
 *    a data item. If it's omitted, will use the column `name` as the key path.
 *    It could be
 *
 *    * A key path string. E.g. 'Foo/Bar'.
 *    * A {@link PropertyCallback} function
 *    * A {@link PropertyConfig} object
 *
 * @property {CellTemplate} template
 *    The template to render a cell for the column.
 *
 * @property {(boolean|number|OrderByKey)} sortable
 *    The ordering configuration. If it's omitted, the column is unsortable.
 *    It could be
 *
 *    * A boolean simply say the column is sortable or not.
 *    * A number, positive for ascending first, otherwise descending first.
 *    * A string, the key path of the sorting values.
 *    * A {@link PropertyGetter} to get the sorting values from data items.
 *      Only available for memory data source.
 *    * A detailed {@link SortableConfig} object.
 *
 * @property {ClassesConfig} colClasses
 *    The classes for the `COL` element in `COLGROUP`.
 * @property {ClassesConfig} headClasses
 *    The classes for the `TH` element in `THEAD`.
 * @property {ClassesConfig} bodyClasses
 *    The classes for the `TD` elements in `TBODY`.
 * @property {ClassesConfig} footClasses
 *    The classes for the `TD` elements in `TFOOT`.
 * @property {ClassesConfig} colAttributes
 *    The attributes for the `COL` element in `COLGROUP`.
 * @property {AttributesConfig} headAttributes
 *    The attributes for the `TH` elements in `THEAD`.
 * @property {AttributesConfig} bodyAttributes
 *    The attributes for the `TD` elements in `TBODY`.
 * @property {AttributesConfig} footAttributes
 *    The attributes for the `TD` elements in `TFOOT`.
 * @property {ColumnConfig[]} columns
 *    The children columns.
 */

/**
 * Columns projection handling columns configuration
 * 1. If the columnsConfig is null, generate the columns config.
 * 2. Add head/body/foot attribute data-column="name" which will render data-column attribute on each cell.
 * @param {Object} state
 * @param {(object[]|FakeArray)} [state.items]
 *    Original data items from data source.
 * @param {ColumnConfig[]} [columnsConfig]
 *    Columns configuration defined by user. If omitted, all columns in original
 *    data will be shown.
 */
function columnsProjectionHandler(state, columns) {
  const defaultColumns = getDefaultColumns(state, columns);
  const extendedColumnsWithDataColumn = extendColumns(defaultColumns, extendDataColumnAttr);

  return _.defaults({
    columns: extendedColumnsWithDataColumn,
  }, state);
}

export const columns = {
  name: 'columns',
  handler: columnsProjectionHandler,
  defaults: null,
};
