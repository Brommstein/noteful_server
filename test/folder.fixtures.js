function makeFolderArray() {
    return [
        {
            id: 1,
            folder_name: 'One'
        },
        {
            id: 2,
            folder_name: 'Two'
        },
        {
            id: 3,
            folder_name: 'Three'
        }
    ];
}

function makeMaliciousImgFolder() {
    const maliciousImgFolder = {
        id: 911,
        folder_name: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
    };
    const expectedImgFolder = {
        ...maliciousImgFolder,
        folder_name: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    };

    return {
        maliciousImgFolder, expectedImgFolder
    }
}

module.exports = {
    makeFolderArray,
    makeMaliciousImgFolder
};