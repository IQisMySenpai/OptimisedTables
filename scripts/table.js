/*function createTable () {
    let headers = {
        first_name: 'First Name',
        last_name: 'Last Name',
        age: 'Age',
        favorite_food: 'Favorite Food',
        favorite_drink: 'Favorite Drink',
        gender: 'Gender',
        preferred_language: 'Preferred Language'
    }

    let table = $('.table');
    let header = $('<div class="table_header"></div>');
    table.append(header);

    for (let key in headers) {
        header.append('<div class="table_cell"><span class="table_cell_text">' + headers[key] + '</span></div>');
    }

    let row_count = Math.ceil(table.outerHeight() / remToPixels(2));
    let row;
    console.log(data[0])
    for (let i = 0; i < row_count; i++) {
        row = $('<div class="table_row"></div>');
        table.append(row);
        for (let key in headers) {
            row.append('<div class="table_cell"><span class="table_cell_text">' + data[i][key] + '</span></div>');
        }
    }
}

function remToPixels (rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}
*/

class OptimisedTable {
    // Elements
    table_wrapper = null;
    table = null;
    table_header = null;
    table_rows = null;
    table_slider = null;

    // Data Attributes
    data_length = -1;

    // Sizes
    table_height= 0;
    table_row_height = 0;
    table_border_width = 0;

    constructor (table_wrapper_id) {
        this.table_wrapper = $('#' + table_wrapper_id);

        this.initialiseElements();
    }

    initialiseElements () {
        this.table_wrapper.addClass('table_wrapper');
        this.table = $('<div class="table"></div>');
        this.table_header = $('<div class="table_header"></div>');
        this.table_slider = $('<div class="slider_wrapper"><div class="slider"><div class="slider_grip"></div></div></div>');

        this.table_wrapper.append(this.table, this.table_slider);
    }

    getDataLength (data) {
        this.data_length = db_data_count();
    }

    updateSizes () {
        this.table_height = this.table.outerHeight();
        this.table_row_height = parseFloat($(':root').css('--table_row_height').replace('px', ''));
        this.table_border_width = parseFloat($(':root').css('--table_border_width').replace('px', ''));
    }


}

window.addEventListener('load', function() {
    let table = new OptimisedTable('myTable', data);
});