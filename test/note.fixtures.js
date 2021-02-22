function makeNoteArray() {
    return [
        {
            id: 1,
            note_name: 'One',
            content: 'This is the One conent',
            date_modified: '2021-01-14T15:52:55.175Z',
            assigned_folder: 1
        },
        {
            id: 2,
            note_name: 'Two',
            content: 'This is the Two conent',
            date_modified: '2021-01-14T15:52:55.175Z',
            assigned_folder: 2
        },
        {
            id: 3,
            note_name: 'Three',
            content: 'This is the Four conent',
            date_modified: '2020-01-14T15:52:55.175Z',
            assigned_folder: 2
        },
        {
            id: 4,
            note_name: 'Four',
            content: 'This is the Four conent',
            date_modified: '2021-01-14T15:52:55.175Z',
            assigned_folder: 3
        }
    ];
}

module.exports = {
    makeNoteArray
};