  // Main sort function.
  // columnKey: a unique key for this column (can be 0, 1, 20, 'booking', etc.)
  function sortList(th, columnKey) {
    var $th    = $(th);
    var $table = $th.closest('table');
    if ($table.length === 0) return;

    // Calculate the real column index based on the <th> position in its row
    var colIndex = $th.parent().children().index($th);
    if (colIndex < 0) return;

    // Get or initialize sort directions for this specific table
    var sortDirections = $table.data('sortDirections');
    if (!sortDirections) {
      sortDirections = {};
      $table.data('sortDirections', sortDirections);
    }

    var key = String(columnKey); // make sure it's a string key
    // Toggle direction for this column key
    var direction = sortDirections[key] === 'asc' ? 'desc' : 'asc';
    sortDirections[key] = direction;

    var $tbody = $table.find('tbody').first();
    var rows   = $tbody.find('tr').get();

    rows.sort(function (rowA, rowB) {
      var aText = getCellValue(rowA, colIndex);
      var bText = getCellValue(rowB, colIndex);

      var aParsed = parseValueWithGroup(aText);
      var bParsed = parseValueWithGroup(bText);

      return compareParsed(aParsed, bParsed, direction);
    });

    // Re-append rows in new order
    rows.forEach(function (row) {
      $tbody.append(row);
    });

    // Update header icons for this table
    updateHeaderIcons($table, $th, direction);
  }

  function getCellValue(row, colIndex) {
    var $cell = $(row).children('td').eq(colIndex);
    return $cell.length ? $cell.text().trim() : '';
  }

  // Parse and classify value: number, date, boolean, alnum, letters, other, etc.
  function parseValueWithGroup(str) {
    var original = (str || '').trim();
    if (original === '') {
      return { raw: original, type: 'empty', group: 'empty', value: null };
    }

    var lower = original.toLowerCase();

    // Boolean?
    if (['true', 'false', 'yes', 'no', 'y', 'n'].includes(lower)) {
      return {
        raw: original,
        type: 'boolean',
        group: 'boolean',
        value: (lower === 'true' || lower === 'yes' || lower === 'y')
      };
    }

    // Remove thousand separators for number detection
    var numeric = original.replace(/,/g, '');

    // Pure number? (only digits, optional sign and decimal)
    if (/^[+-]?\d+(\.\d+)?$/.test(numeric)) {
      return {
        raw: original,
        type: 'number',
        group: 'number',
        value: parseFloat(numeric)
      };
    }

    // Date?
    var timestamp = Date.parse(original);
    if (!isNaN(timestamp)) {
      return {
        raw: original,
        type: 'date',
        group: 'date',
        value: new Date(timestamp)
      };
    }

    // Alphanumeric / letters classification (for mixed columns)
    var hasDigit  = /\d/.test(original);
    var hasLetter = /[a-zA-Z]/.test(original);

    var group;
    if (hasDigit && hasLetter) {
      group = 'alnum';        // e.g., "345FDGDFG"
    } else if (!hasDigit && hasLetter) {
      group = 'letters';      // e.g., "FGHFGH"
    } else if (hasDigit && !hasLetter) {
      // Should have been caught as pure number above, but just in case
      group = 'number';
    } else {
      group = 'other';        // symbols, etc.
    }

    return {
      raw: original,
      type: 'string',
      group: group,
      value: lower
    };
  }

  function compareParsed(a, b, direction) {
    // Group order: numbers first, then date/boolean, then alnum, then letters, then others
    var groupOrder = ['number', 'date', 'boolean', 'alnum', 'letters', 'other', 'empty'];
    var groupRank = {};
    groupOrder.forEach(function (g, idx) { groupRank[g] = idx; });

    var rankA = groupRank[a.group] ?? 999;
    var rankB = groupRank[b.group] ?? 999;

    // 1) Compare by group (enforces: number -> alnum -> letters, etc.)
    if (rankA !== rankB) {
      var groupResult = rankA - rankB;
      return direction === 'asc' ? groupResult : -groupResult;
    }

    // 2) Same group: compare internal values
    var result = 0;

    if (a.type === 'number' && b.type === 'number') {
      result = a.value - b.value;
    } else if (a.type === 'date' && b.type === 'date') {
      result = a.value - b.value;
    } else if (a.type === 'boolean' && b.type === 'boolean') {
      // false < true
      if (a.value === b.value) result = 0;
      else result = a.value ? 1 : -1;
    } else {
      // Everything else: compare as lowercase strings
      var sa = String(a.value ?? a.raw).toLowerCase();
      var sb = String(b.value ?? b.raw).toLowerCase();
      result = sa.localeCompare(sb);
    }

    return direction === 'asc' ? result : -result;
  }

  function updateHeaderIcons($table, $activeTh, direction) {
    var $headers = $table.find('thead th');

    $headers.each(function () {
      var $th = $(this);

      // Remove any old icon
      $th.find('.sort-icon').remove();

      if ($th[0] === $activeTh[0]) {
        // Add icon only on the active sorted column
        var iconChar = direction === 'asc' ? '▲' : '▼';

        var $icon = $('<span>')
          .addClass('sort-icon')
          .text(iconChar)
          .css({
            'margin-left': '6px',
            'font-size': '0.85rem',
            'color': '#cc5500',
            'font-weight': 'bold'
          });

        $th.append($icon);
      }
    });
  }