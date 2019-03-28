// A list of images to load on scene

/*const IMAGES = [
    'unit-archer',
    'unit-knight',
    'unit-skeleton',
    'select', 'tile-selectable',
    'select-move', 'action-move',
    'select-dash', 'action-dash',
    'select-stab', 'action-stab',
    'select-swing-sword', 'action-swing-sword',
    'select-arrowshoot', 'action-arrowshoot',
    'action-no-icon',
    'action',
    'play-turn',

    'bars-background', 'bars-health', 'bars-stamina', 'bars-redmark', 'bars-bluemark', 'bars-change'
];*/

const IMAGES = [];

function IMAGE_INSERT(type, name) {
    IMAGES.push({ type: type, name: name });
}

IMAGE_INSERT('image', 'brick-main');
IMAGE_INSERT('image', 'brick-left');
IMAGE_INSERT('image', 'brick-right');