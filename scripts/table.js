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
    table_slider_wrapper = null;
    table_slider = null;
    table_slider_grip = null;

    // Data Attributes
    data_length = -1;
    data_keys = null;
    row_count = -1;

    // Sizes
    table_height= 0;
    table_row_height = 0;
    table_border_width = 0;

    constructor (table_wrapper_id) {
        this.table_wrapper = $('#' + table_wrapper_id);
        this.table_rows = [];

        this.initialiseElements();
        this.getDataLength()
        this.updateSizes()
        this.loadHeaders();
        this.loadRows(0);

    }

    initialiseElements () {
        this.table_wrapper.addClass('table_wrapper');
        this.table = $('<div class="table"></div>');
        this.table_header = $('<div class="table_header"></div>');
        // this.table_slider_wrapper = $('<div class="slider_wrapper"></div>');
        // this.table_slider = $('<div class="slider"></div>');
        // this.table_slider_grip = $('<div class="slider_grip"></div>');

        this.table_wrapper.append(this.table, this.table_slider_wrapper);
        // this.table_slider.append(this.table_slider_grip);
        // this.table_slider_wrapper.append(this.table_slider);

        this.table.bind('DOMMouseScroll mousewheel', function (event) {
            this.onScroll(event);
        }.bind(this));
    }

    getDataLength () {
        this.data_length = db_data_count();

    }

    updateSizes () {
        this.table_height = this.table.outerHeight();
        this.table_border_width = parseFloat($(':root').css('--table_border_width').replace('px', ''));
        this.table_row_height = parseFloat($(':root').css('--table_row_height').replace('px', ''));
    }

    loadHeaders () {
        let headers = db_get_headers();
        let header = $('<div class="table_header"></div>');
        this.table.append(header);

        for (let key in headers) {
            header.append('<div class="table_cell"><span class="table_cell_text">' + headers[key] + '</span></div>');
        }
    }

    loadRows (start = 0) {
        this.row_count = Math.ceil(this.table_height / this.table_row_height) + 3;
        let row;
        let keys = db_get_keys();
        for (let i = 0; i < this.row_count; i++) {
            row = $('<div class="table_row"></div>');
            this.table.append(row);
            this.table_rows.push(row);
            for (let key of keys) {
                row.append('<div class="table_cell"><span class="table_cell_text">' + data[start + i][key] + '</span></div>');
            }
            row.css('top', ((i + 1) * this.table_row_height) + 'px');
        }
    }

    onScroll (event) {
        console.log('scroll')
        if(event.originalEvent.wheelDelta /120 > 0) {
            console.log('scrolling up !');
        }
        else{
            console.log('scrolling down !');
        }
        for (let i = 0; i < this.table_rows.length; i++) {
            let row = this.table_rows[i];
            let top = parseFloat(row.style.top.replace('px', ''));
            if (top < -this.table_row_height) {
                row.style.top = (this.table_row_height * (this.row_count + 1)) + 'px';
            }
        }
    }
}

window.addEventListener('load', function() {
    let table = new OptimisedTable('myTable', data);
});