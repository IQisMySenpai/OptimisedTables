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
    preload_count = 0;
    loaded_up_until = 0;
    preload_up = null;
    first_row = 0;
    last_row = 0;
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
        this.table_height = this.table_body.outerHeight();
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
        let shiftOffset = 0;

        if (start < 0) start = 0;



        if (start + this.row_count > this.data_length) {
            start = this.data_length - this.row_count;
            shiftOffset = this.table_height - (this.row_count * this.table_row_height);
        }

        if (start % 2 !== 0) {
            start--;
            shiftOffset = this.table_row_height + this.table_border_width;
        }


        let start_index = start - this.preload_count;
        if (start_index < 0) start_index = 0;
        let end = start + this.row_count + this.preload_count;
        let end_index = end + this.preload_count;
        if (end_index > this.data_length) end_index = this.data_length;

        let data = db_get_data(start_index, end_index);

        this.preload_up = data.splice(0, start - start_index);
        this.loaded_up_until = start_index

        this.first_row = start;
        this.raw_data = data.splice(0, this.row_count);
        this.last_row = start + this.row_count;

        this.preload_down = data;
        this.loaded_down_until = end_index;

        for (let i = 0; i < this.row_count; i++) {
            row = $('<div class="table_row"></div>');
            this.table_body.append(row);
            this.table_rows.push(row);
            for (let key of this.data_keys) {
                row.append('<div class="table_cell"><span class="table_cell_text">' + this.raw_data[i][key] + '</span></div>');
            }
            row.css('top', (i * this.table_row_height - shiftOffset) + 'px');
        }
    }

    onScroll (event) {
        let delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
        let top;
        let preload = true

        if (delta === 0) {
            return;
        }

        let isScrollDown = delta < 0;

        let rows_moved = Math.ceil(delta / this.table_row_height);

        if (this.first_row === 0 && !isScrollDown) {
            top = parseFloat(this.table_rows[0].css('top').replace('px', ''));
            if (top >= 0 || top + delta >= 0) {
                delta = -top;
            }
            preload = false;
        } else if (this.first_row - rows_moved <= 0 && !isScrollDown) {
            delta = this.first_row * this.table_row_height;
        }

        if (this.last_row === this.data_length && isScrollDown) {
            top = parseFloat(this.table_rows[this.table_rows.length - 1].css('top').replace('px', ''));
            if (top <= this.table_height - this.table_row_height || top + delta <= this.table_height - this.table_row_height) {
                delta = this.table_height - this.table_row_height - top;
            }
            preload = false;
        } else if (this.last_row - rows_moved >= this.data_length && isScrollDown) {
            delta = (this.data_length - this.last_row) * this.table_row_height;
        }


        top = this.moveRows(delta);

        console.log($('.table_row').length);

        if (!preload) return;

        if (delta < 0) {
            this.scrollDown(delta, top);
        } else {
            this.scrollUp(delta);
        }
    }

    moveRows (delta) {
        let top;
        for (let i = 0; i < this.table_rows.length; i++) {
            let row = this.table_rows[i];
            top = parseFloat(row.css('top').replace('px', '')) + delta;
            row.css('top', top + 'px');
        }
        return top;
    }

    scrollDown (delta, top) {
        let row = this.table_rows[1];
        while (parseFloat(row.css('top').replace('px', '')) < -this.table_row_height) {
            for (let i = 0; i < 2; i++) {
                this.table_rows.shift().remove();
                this.preload_up.push(this.raw_data.shift());
                this.first_row += 1;
                this.last_row += 1;
                if (this.preload_down.length === 0) {
                    return;
                }
                let new_data = this.preload_down.shift();
                let new_row = $('<div class="table_row"></div>');
                for (let key of this.data_keys) {
                    new_row.append('<div class="table_cell"><span class="table_cell_text">' + new_data[key] + '</span></div>');
                }
                top += this.table_row_height;
                new_row.css('top', top + 'px');
                this.table_body.append(new_row);
                this.table_rows.push(new_row);
                this.raw_data.push(new_data);
            }

            row = this.table_rows[1];
            this.checkPreloadDown()
            this.checkPreloadUpLength()
        }
    }

    scrollUp (delta) {
        let row = this.table_rows[this.table_rows.length - 2];
        let top = parseFloat(this.table_rows[0].css('top').replace('px', ''));
        while (parseFloat(row.css('top').replace('px', '')) > this.table_height) {
            for (let i = 0; i < 2; i++) {
                this.table_rows.pop().remove();
                this.preload_down.unshift(this.raw_data.pop());
                this.first_row -= 1;
                this.last_row -= 1;
                let new_data = this.preload_up.pop();
                let new_row = $('<div class="table_row"></div>');
                for (let key of this.data_keys) {
                    new_row.append('<div class="table_cell"><span class="table_cell_text">' + new_data[key] + '</span></div>');
                }
                top -= this.table_row_height;
                new_row.css('top', top + 'px');
                this.table_body.prepend(new_row);
                this.table_rows.unshift(new_row);
                this.raw_data.unshift(new_data);
            }
            row = this.table_rows[this.table_rows.length - 2];
            this.checkPreloadUp()
            this.checkPreloadDownLength()
        }
    }

    checkPreloadDown () {
        if (this.loaded_down_until >= this.data_length) return;
        if (this.preload_down.length < this.preload_count) {
            let data = db_get_data(this.loaded_down_until, this.loaded_down_until + this.preload_count);
            this.loaded_down_until += this.preload_count;
            this.preload_down = this.preload_down.concat(data);
            if (this.loaded_down_until > this.data_length) this.loaded_down_until = this.data_length;
        }
    }

    checkPreloadDownLength () {
        let len = this.preload_down.length;
        if (len > this.preload_count * 2) {
            this.preload_down = this.preload_down.slice(0, this.preload_count * 2);
            this.loaded_down_until -= len - this.preload_count * 2;
        }
    }

    checkPreloadUp () {
        if (this.loaded_up_until < 0) return;
        if (this.preload_up.length < this.preload_count) {
            let first = this.loaded_up_until - this.preload_count;
            if (first < 0) first = 0;
            let data = db_get_data(first, this.loaded_up_until);
            this.loaded_up_until -= this.preload_count;
            this.preload_up = data.concat(this.preload_up);
            if (this.loaded_up_until < 0) this.loaded_up_until = 0;
        }
    }

    checkPreloadUpLength () {
        let len = this.preload_up.length;
        if (len > this.preload_count * 2) {
            this.preload_up = this.preload_up.slice(len - this.preload_count * 2, len);
            this.loaded_up_until += len - this.preload_count * 2;
        }
    }


}
var table = null;
window.addEventListener('load', function() {
    table = new OptimisedTable('myTable');
});