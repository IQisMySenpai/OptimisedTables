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
    // table_slider_wrapper = null;
    // table_slider = null;
    // table_slider_grip = null;

    // Data Attributes
    data_length = -1;
    data_keys = null;
    row_count = -1;

    // Sizes
    table_height= 0;
    table_row_height = 0;
    table_border_width = 0;

    // Preload Data
    preload_count = 40;
    preload_up = null;
    raw_data = null;
    preload_down = null;
    loaded_down_until = 0;

    constructor (table_wrapper_id) {
        this.table_wrapper = $('#' + table_wrapper_id);
        this.table_rows = [];
        this.preload_down = [];
        this.raw_data = [];
        this.preload_up = [];

        this.initialiseElements();
        this.getDataInfo()
        this.updateSizes()
        this.updateRowCount();
        this.loadHeaders();
        this.loadRows(0);
    }

    initialiseElements () {
        this.table_wrapper.addClass('table_wrapper');
        this.table = $('<div class="table"></div>');
        this.table_header = $('<div class="table_header"></div>');
        this.table_body = $('<div class="table_body"></div>');
        // this.table_slider_wrapper = $('<div class="slider_wrapper"></div>');
        // this.table_slider = $('<div class="slider"></div>');
        // this.table_slider_grip = $('<div class="slider_grip"></div>');
        this.table.append(this.table_header, this.table_body);
        this.table_wrapper.append(this.table/*, this.table_slider_wrapper*/);
        // this.table_slider.append(this.table_slider_grip);
        // this.table_slider_wrapper.append(this.table_slider);

        this.table.bind('DOMMouseScroll mousewheel', function (event) {
            this.onScroll(event);
        }.bind(this));
    }

    getDataInfo () {
        this.data_length = db_data_count();
        this.data_keys = db_get_keys();
    }

    updateSizes () {
        this.table_height = this.table.outerHeight();
        this.table_border_width = parseFloat($(':root').css('--table_border_width').replace('px', ''));
        this.table_row_height = parseFloat($(':root').css('--table_row_height').replace('px', ''));
    }

    updateRowCount () {
        this.row_count = Math.ceil(this.table_height / this.table_row_height) + 2;
        if (this.row_count % 2 !== 0) this.row_count++;
        this.preload_count = this.row_count * 2;
    }

    loadHeaders () {
        let headers = db_get_headers();

        for (let key in headers) {
            this.table_header.append('<div class="table_cell"><span class="table_cell_text">' + headers[key] + '</span></div>');
        }
    }

    loadRows (start = 0) {
        let row;
        let data = db_get_data(0, this.row_count + this.preload_count);
        this.raw_data = data.splice(0, this.row_count);
        this.preload_down = data.splice(this.row_count, this.preload_count);
        this.loaded_down_until = this.row_count + this.preload_count;
        for (let i = 0; i < this.row_count; i++) {
            row = $('<div class="table_row"></div>');
            this.table_body.append(row);
            this.table_rows.push(row);
            for (let key of this.data_keys) {
                row.append('<div class="table_cell"><span class="table_cell_text">' + data[start + i][key] + '</span></div>');
            }
            row.css('top', (i * this.table_row_height) + 'px');
        }
    }

    onScroll (event) {
        let delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
        let top;
        for (let i = 0; i < this.table_rows.length; i++) {
            let row = this.table_rows[i];
            top = parseFloat(row.css('top').replace('px', '')) + delta;
            row.css('top', top + 'px');
        }

        let row = this.table_rows[1];
        while (parseFloat(row.css('top').replace('px', '')) < -this.table_row_height) {
            for (let i = 0; i < 2; i++) {
                this.table_rows.shift().remove();
                this.preload_up.push(this.raw_data.shift());
                let new_data = this.preload_down.shift();
                let row = $('<div class="table_row"></div>');
                for (let key of this.data_keys) {
                    row.append('<div class="table_cell"><span class="table_cell_text">' + new_data[key] + '</span></div>');
                }
                top += this.table_row_height;
                row.css('top', top + 'px')
                this.table_body.append(row);
                this.table_rows.push(row);
                this.raw_data.push(new_data);
            }
            row = this.table_rows[1];
            this.checkPreloadDown()
        }
    }

    checkPreloadDown () {
        if (this.preload_down.length < this.preload_count) {
            let data = db_get_data(this.loaded_down_until, this.loaded_down_until + this.preload_count);
            this.loaded_down_until += this.preload_count;
            this.preload_down = this.preload_down.concat(data);
        }
    }
}

window.addEventListener('load', function() {
    let table = new OptimisedTable('myTable');
});