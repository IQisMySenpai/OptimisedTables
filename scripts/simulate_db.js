function db_data_count () {
    return db.length
}

function db_get_headers () {
    return [
        'ID',
        'First Name',
        'Last Name',
        'Email',
        'City',
        'Birthday',
        'Favorite Color'
    ]
}

function db_get_keys () {
    return [
        'id',
        'first_name',
        'last_name',
        'email',
        'city',
        'birthday',
        'favorite_color'
    ]
}

function db_get_data (start, end) {
    return db.slice(start, end);
}