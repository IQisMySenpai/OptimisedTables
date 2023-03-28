function db_data_count () {
    return db.length
}

function db_get_headers () {
    return [
        'First Name',
        'Last Name',
        'Age',
        'Favorite Food',
        'Favorite Drink',
        'Gender',
        'Preferred Language'
    ]
}

function db_get_keys () {
    return [
        'first_name',
        'last_name',
        'age',
        'favorite_food',
        'favorite_drink',
        'gender',
        'preferred_language'
    ]
}

function db_get_data (start, end) {
    return db.slice(start, end);
}