import _ from 'underscore';

class ColumnGroup {
  constructor(columns) {
    this.headerRows = [];
    this.leafColumns = [];

    const buildColumn = ({
      name,
      parent = null,
      columns = [],
      html = name,
      height = 1,
    }) => {
      const col = { name, parent, html, height };

      col.rowIndex = parent ? parent.rowIndex + parent.height : 0;
      col.columns = _.map(columns, c => buildColumn(_.extend({ parent: col }, c)));
      col.treeHeight = height;
      col.treeWidth = 1;
      if (!_.isEmpty(col.columns)) {
        col.treeHeight += _.chain(col.columns)
          .map(_.property('treeHeight')).max().value();
        col.treeWidth = _.chain(col.columns)
          .map(_.property('treeWidth')).reduce((a, b) => a + b, 0).value();
      }

      if (_.isEmpty(col.columns)) {
        this.leafColumns.push(col);
      }

      return col;
    };

    const buildColumnHeader = col => {
      if (col.parent) {
        const colspan = col.treeWidth;
        const rowspan = _.isEmpty(col.columns) ? this.root.treeHeight - col.rowIndex : col.height;
        const html = col.html;

        while (this.headerRows.length <= col.rowIndex) {
          this.headerRows.push({ cells: [] });
        }
        this.headerRows[col.rowIndex].cells.push({ colspan, rowspan, html });
      }
      _.each(col.columns, buildColumnHeader);
    };

    this.root = buildColumn({
      name: '$root',
      height: 0,
      columns,
    });

    buildColumnHeader(this.root);
  }

  get height() {
    return this.root.treeHeight;
  }

  get width() {
    return this.root.treeWidth;
  }
}

export default ColumnGroup;
